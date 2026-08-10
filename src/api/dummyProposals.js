// ---------------------------------------------------------------------------
// DUMMY DATA — for frontend-only development before the backend is wired up.
//
// Shape matches exactly what GET /api/v1/proposals/:id is expected to return
// (see underwritingApi.js -> getProposal). Once the backend teammate's
// endpoint is live, delete this file and every screen that imports it keeps
// working unchanged — they already call the real getProposal()/listProposals()
// functions, this is just what stands in for the response meanwhile.
// ---------------------------------------------------------------------------

const NAMES = [
  "Ananya Rajan",
  "Karthik Suresh",
  "Divya Menon",
  "Rahul Verma",
  "Priya Nair",
  "Arjun Iyer",
];

const INSURANCE_TYPES = ["Term Life", "Health", "Critical Illness", "Whole Life"];

function seededPick(list, seed) {
  return list[seed % list.length];
}

export function getDummyProposal(id) {
  const seed = Number(id) || 1;
  const riskScore = 20 + ((seed * 17) % 70); // 20-90 spread

  return {
    id: seed,
    full_name: seededPick(NAMES, seed),
    insurance_type: seededPick(INSURANCE_TYPES, seed),
    status: seed % 3 === 0 ? "APPROVED" : seed % 3 === 1 ? "PENDING" : "REJECTED",
    created_at: "2026-07-2" + (seed % 9),

    // client-entered details
    age: 24 + (seed % 30),
    annual_income: 400000 + seed * 25000,
    sum_assured: 1000000 + seed * 100000,
    height: 160 + (seed % 25),
    weight: 55 + (seed % 30),
    bmi: (22 + (seed % 6) * 0.7).toFixed(1),
    smoker: seed % 4 === 0 ? "yes" : "no",
    alcohol_consumption: seededPick(["none", "occasional", "regular"], seed),
    pre_existing_disease: seed % 5 === 0 ? "yes" : "no",
    family_medical_history: seed % 3 === 0 ? "yes" : "no",
    occupation: seededPick(["office", "field", "hazardous"], seed),
    credit_score: 650 + (seed % 200),
    num_previous_claims: seed % 3,
    years_with_insurer: seed % 8,

    // AI risk output
    risk_score: riskScore,
    reasoning_summary:
      "Automated assessment based on the applicant's declared health, lifestyle, and financial profile. Placeholder text — will be replaced by the live model output once connected.",
    risk_factors: [
      { detail: "Elevated BMI relative to age group" },
      { detail: "Family history of cardiovascular condition" },
    ],
    positive_factors: [
      { detail: "Stable income-to-cover ratio" },
      { detail: "No previous claims on record" },
    ],

    // document verification placeholder
    documents: [
      { name: "Government ID", status: "PENDING" },
      { name: "Income Proof", status: "PENDING" },
    ],
  };
}

// Used by UnderwriterDashboard.jsx to populate the "All Proposals" table
// before the backend's list endpoint is live.
export function getDummyProposalList(count = 6) {
  return Array.from({ length: count }, (_, i) => getDummyProposal(i + 1));
}
