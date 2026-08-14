// ---------------------------------------------------------------------------
// DUMMY MOTOR PROPOSAL DATA — frontend-only stand-in for the motor line.
//
// A motor proposal belongs to one client (an individual OR a fleet owner /
// company) and holds ONE OR MORE vehicles. This mirrors how real motor
// insurance works: a single policyholder can insure a fleet of vehicles
// under one proposal, each vehicle carrying its own risk profile.
//
// Suggested backend contract once wired up (mirrors the existing
// GET /api/v1/proposals/:id, extended with a `vehicles` array):
//
//   GET /api/v1/motor-proposals        -> list (same shape as below, vehicles omitted for list view)
//   GET /api/v1/motor-proposals/:id    -> single proposal, full `vehicles` array included
//
// Each vehicle object's fields already match what dummyMotorRisk.js's
// getDummyMotorRiskResult() expects, so scoring works without translation.
// Delete this file once the backend teammate's endpoint is live — every
// screen that imports it already calls through a USE_DUMMY_DATA flag.
// ---------------------------------------------------------------------------

const OWNERS = [
  "Sundaram Logistics Pvt Ltd",
  "Meera Krishnan",
  "Bluewave Cabs Pvt Ltd",
  "Arvind Rao",
  "Coastal Freight Carriers",
  "Nithya Balan",
  "Metro Fleet Services",
  "Suresh Pillai",
];

const MAKES_MODELS = [
  { make: "Maruti Suzuki", model: "Swift" },
  { make: "Hyundai", model: "Creta" },
  { make: "Tata", model: "Ace" },
  { make: "Mahindra", model: "Bolero" },
  { make: "Toyota", model: "Innova Crysta" },
  { make: "Ashok Leyland", model: "Dost" },
  { make: "Honda", model: "City" },
  { make: "Kia", model: "Seltos" },
];

const FUEL_TYPES = ["petrol", "diesel", "electric", "cng", "hybrid"];

function seededPick(list, seed) {
  return list[seed % list.length];
}

function makeVehicle(proposalSeed, idx) {
  const seed = proposalSeed * 7 + idx * 13;
  const { make, model } = seededPick(MAKES_MODELS, seed);
  const vehicleAge = 1 + (seed % 12);
  const drivingExperience = 1 + (seed % 18);
  const ncb = [0, 10, 20, 30, 40, 50][seed % 6];
  const priorClaim = seed % 5 === 0 ? 1 : 0;
  const commercialUse = seed % 3 === 0 ? 1 : 0;
  const numPreviousClaims = seed % 4 === 0 ? 2 : seed % 3;
  const driverAge = 21 + (seed % 45);
  const previousAccidents = priorClaim ? 1 + (seed % 2) : seed % 6 === 0 ? 1 : 0;
  const annualMileageKm = 6000 + (seed % 20) * 1500;

  return {
    vehicle_id: `${proposalSeed}-V${idx + 1}`,
    vehicle_make: make,
    vehicle_model: model,
    vehicle_year: 2026 - vehicleAge,
    registration_number: `TN${10 + (seed % 80)}-${String.fromCharCode(65 + (seed % 26))}${String.fromCharCode(65 + ((seed * 3) % 26))}-${1000 + (seed % 8999)}`,
    fuel_type: seededPick(FUEL_TYPES, seed),
    vehicle_usage: commercialUse ? "commercial" : "personal",
    vehicle_age_years: vehicleAge,
    driver_age: driverAge,
    previous_accidents: previousAccidents,
    annual_mileage_km: annualMileageKm,
    driving_experience_years: drivingExperience,
    no_claim_bonus_percent: ncb,
    prior_accident_claim: priorClaim,
    commercial_use: commercialUse,
    num_previous_claims: numPreviousClaims,
    years_with_insurer: seed % 9,
    credit_score: 620 + (seed % 220),
    idv: 350000 + (seed % 20) * 45000,
    status: numPreviousClaims >= 2 || priorClaim ? "PENDING" : seed % 5 === 0 ? "REJECTED" : "APPROVED",
    documents: [
      { name: "RC Book", status: seed % 6 === 0 ? "MISMATCH" : "VERIFIED" },
      { name: "Driving License", status: seed % 7 === 0 ? "MISMATCH" : "VERIFIED" },
      { name: "Previous Insurance Policy", status: priorClaim ? "FLAGGED" : "VERIFIED" },
      { name: "PUC Certificate", status: seed % 9 === 0 ? "MISSING" : "VERIFIED" },
    ],
  };
}

export function getDummyMotorProposal(id) {
  const seed = Number(id) || 1;
  const numVehicles = 1 + (seed % 5); // 1–5 vehicles per proposal (fleet-capable)
  const vehicles = Array.from({ length: numVehicles }, (_, i) => makeVehicle(seed, i));

  const anyPending = vehicles.some((v) => v.status === "PENDING");
  const anyRejected = vehicles.some((v) => v.status === "REJECTED");
  const overallStatus = anyPending ? "PENDING" : anyRejected ? "REJECTED" : "APPROVED";

  return {
    id: seed,
    full_name: seededPick(OWNERS, seed),
    insurance_type: "Vehicle Insurance",
    fleet_type: numVehicles > 1 ? "Fleet" : "Individual",
    status: overallStatus,
    created_at: "2026-07-2" + (seed % 9),

    // policyholder-level fields
    occupation: seededPick(["office", "field", "logistics", "hazardous"], seed),
    annual_income: 450000 + seed * 30000,
    credit_score: 640 + (seed % 210),
    years_with_insurer: seed % 8,

    vehicles,
  };
}

export function getDummyMotorProposalList(count = 8) {
  return Array.from({ length: count }, (_, i) => getDummyMotorProposal(i + 1));
}
