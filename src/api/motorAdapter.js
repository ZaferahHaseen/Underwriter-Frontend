// ---------------------------------------------------------------------------
// MOTOR ADAPTER — bridges the real backend (flat: 1 vehicle = 1 proposal,
// optionally grouped by fleet_group_id) to the shape the underwriter Motor
// UI pages were built against (api/dummyMotorProposals.js / dummyMotorRisk.js:
// one "proposal" object holding a `vehicles` array).
//
// Every function here returns EXACTLY the same shape as its dummy
// counterpart, so MotorDashboard.jsx / MotorProposalDetails.jsx /
// MotorVehicleDetails.jsx / MotorRiskAnalysis.jsx / MotorDocumentVerification.jsx
// need no changes beyond swapping which module they import from.
//
// Grouping id used in routes (/motor-proposal/:id):
//   - ungrouped vehicle -> that vehicle's own proposal id (a number)
//   - fleet (2+ vehicles submitted together) -> its fleet_group_id (a UUID string)
// ---------------------------------------------------------------------------
import {
  listVehicleProposals,
  getVehicleProposal,
  getFleetProposal,
  decideVehicleProposal,
} from "./underwritingApi";

function mapVehicle(row) {
  // row = one item from GET /api/v1/vehicle/proposals (list) OR the
  // "vehicles" array inside GET /api/v1/vehicle/fleet/:id, OR built
  // directly from GET /api/v1/vehicle/proposals/:id (single detail).
  const raw = row.raw_input || row.vehicle || {};
  const vehicleRow = row.vehicle || {}; // full `vehicles` table row, when present

  const documents = row.document_filename
    ? [{ name: row.document_filename, status: (row.validation_results || []).some((v) => !v.valid) ? "FLAGGED" : "VERIFIED" }]
    : [];

  return {
    vehicle_id: row.id ?? row.proposal_id,
    vehicle_make: raw.make ?? vehicleRow.make,
    vehicle_model: raw.model ?? vehicleRow.model,
    vehicle_year: raw.year ?? vehicleRow.year,
    registration_number: "—", // not captured at proposal time (see client_router.py)
    fuel_type: raw.fuel_type ?? vehicleRow.fuel_type,
    vehicle_usage: raw.usage_type,
    vehicle_age_years: raw.year ? new Date().getFullYear() - Number(raw.year) : null,
    driver_age: raw.driver_age,
    previous_accidents: raw.previous_accidents,
    annual_mileage_km: raw.annual_mileage,
    driving_experience_years: raw.driving_experience,
    no_claim_bonus_percent: raw.previous_claims === 0 ? 20 : 0, // not collected by full form; reasonable default
    prior_accident_claim: raw.previous_accidents > 0 ? 1 : 0,
    commercial_use: raw.usage_type === "commercial" ? 1 : 0,
    num_previous_claims: raw.previous_claims,
    years_with_insurer: raw.previous_insurance === "yes" ? 1 : 0,
    credit_score: null, // vehicle proposals don't collect this
    idv: raw.vehicle_value ?? vehicleRow.vehicle_value,
    status: row.status,

    // --- previously dropped fields: backend/RawVehicleProposalRequest
    // captures these from the client form but the adapter never surfaced
    // them, so the underwriter UI had nothing to render. ---
    vehicle_type: raw.vehicle_type,
    engine_cc: raw.engine_cc,
    color: raw.color,
    safety_features: raw.safety_features,
    anti_theft: raw.anti_theft,
    license_age: raw.license_age,
    traffic_violations: raw.traffic_violations,
    city: raw.city,
    region: raw.region,
    previous_insurance: raw.previous_insurance,
    policy_lapses: raw.policy_lapses,
    documents,
    // extras used directly by the adapter (not part of the original dummy shape,
    // but harmless additions — consumed below for risk-analysis wiring)
    _risk_score: row.risk_score,
    _confidence: row.confidence,
    _reasoning_summary: row.reasoning_summary,
    _risk_factors: row.risk_factors,
    _positive_factors: row.positive_factors,
  };
}

function overallStatus(vehicles) {
  const statuses = new Set(vehicles.map((v) => v.status));
  if (statuses.size === 1) return [...statuses][0];
  return "MIXED";
}

// ---- List view: GET /api/v1/vehicle/proposals, grouped by fleet_group_id ----
export async function getMotorProposalList() {
  const rows = await listVehicleProposals();

  const groups = new Map(); // key: fleet_group_id or `single-${id}`
  rows.forEach((r) => {
    const key = r.fleet_group_id || `single-${r.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  return Array.from(groups.entries()).map(([key, group]) => {
    const isFleet = group.length > 1;
    const first = group[0];
    return {
      id: isFleet ? first.fleet_group_id : first.id,
      full_name: first.full_name,
      fleet_type: isFleet ? "Fleet" : "Individual",
      status: overallStatus(group),
      created_at: String(first.created_at).slice(0, 10),
      vehicles: group.map((g) => ({ vehicle_id: g.id })), // list view only needs a count
    };
  });
}

// ---- Detail view: single vehicle OR fleet, by the id used in the route ----
export async function getMotorProposal(id) {
  const isFleet = typeof id === "string" && id.includes("-") && !/^\d+$/.test(id);

  if (isFleet) {
    const fleet = await getFleetProposal(id);
    const vehicles = fleet.vehicles.map((v) =>
      mapVehicle({ ...v, id: v.proposal_id, raw_input: v.raw_input, status: v.status,
        risk_score: v.risk_score, confidence: v.confidence,
        reasoning_summary: v.reasoning_summary, risk_factors: v.risk_factors,
        positive_factors: v.positive_factors })
    );
    return {
      id: fleet.fleet_group_id,
      full_name: fleet.full_name,
      insurance_type: "Vehicle Insurance",
      fleet_type: "Fleet",
      status: fleet.overall_status,
      created_at: "",
      occupation: "—",
      annual_income: 0,
      credit_score: "—",
      years_with_insurer: "—",
      vehicles,
    };
  }

  const p = await getVehicleProposal(id);
  return {
    id: p.id,
    full_name: p.full_name,
    insurance_type: "Vehicle Insurance",
    fleet_type: "Individual",
    status: p.status,
    created_at: String(p.created_at).slice(0, 10),
    occupation: "—",
    annual_income: 0,
    credit_score: "—",
    years_with_insurer: "—",
    vehicles: [mapVehicle(p)],
  };
}

// ---- Risk analysis view: reuse the SAME real risk_score/factors already
// computed and stored by the backend when the proposal was submitted
// (no re-scoring needed — the model already ran server-side). ----
export async function getMotorFleetRiskResult(vehicles) {
  const results = vehicles.map((v) => ({
    vehicle: v,
    result: {
      risk_score: v._risk_score,
      confidence: v._confidence,
      reasoning_summary: v._reasoning_summary,
      risk_factors: v._risk_factors || [],
      positive_factors: v._positive_factors || [],
    },
  }));

  const scored = results.filter((r) => r.result.risk_score != null);
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, r) => sum + r.result.risk_score, 0) / scored.length)
    : 0;
  const highestRisk = scored.length
    ? scored.reduce((max, r) => (r.result.risk_score > max.result.risk_score ? r : max), scored[0])
    : results[0];

  return {
    fleet_risk_score: avgScore,
    vehicle_count: vehicles.length,
    highest_risk_vehicle: highestRisk.vehicle,
    vehicles_needing_review: scored.filter((r) => r.result.risk_score >= 60).length,
    per_vehicle: results,
  };
}

// ---- Underwriter decision on one vehicle (shared decision endpoint) ----
export async function decideMotorVehicle(vehicleProposalId, status) {
  return decideVehicleProposal(vehicleProposalId, status);
}