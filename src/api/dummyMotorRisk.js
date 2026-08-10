// ---------------------------------------------------------------------------
// DUMMY MOTOR RISK SCORING — frontend-only stand-in until the backend
// teammate wires up a real motor underwriting endpoint (e.g. POST
// /api/v1/underwrite/motor, mirroring the existing getUnderwritingDecision()
// for health).
//
// This computes a believable risk score + factors ENTIRELY in the browser
// from the form inputs below, so the Motor Quick Check screen is fully
// demoable without any database or model. Once the backend endpoint exists,
// replace the call to getDummyMotorRiskResult() in RiskAnalysis.jsx with a
// real API call — the returned shape here already matches what the real
// endpoint should return, so nothing else needs to change.
// ---------------------------------------------------------------------------

export function getDummyMotorRiskResult(form) {
  let score = 40; // baseline
  const riskFactors = [];
  const positiveFactors = [];

  // Vehicle age
  if (form.vehicle_age_years >= 10) {
    score += 15;
    riskFactors.push({ detail: "Vehicle is over 10 years old, raising mechanical and safety risk", feature: "vehicle_age", weight: 0.15 });
  } else if (form.vehicle_age_years <= 3) {
    score -= 8;
    positiveFactors.push({ detail: "Newer vehicle with modern safety features", feature: "vehicle_age", weight: 0.08 });
  }

  // Driving experience
  if (form.driving_experience_years < 2) {
    score += 15;
    riskFactors.push({ detail: "Less than 2 years of driving experience", feature: "driving_experience", weight: 0.15 });
  } else if (form.driving_experience_years >= 10) {
    score -= 10;
    positiveFactors.push({ detail: "Over 10 years of driving experience", feature: "driving_experience", weight: 0.1 });
  }

  // No-claim bonus
  if (form.no_claim_bonus_percent >= 20) {
    score -= 10;
    positiveFactors.push({ detail: `${form.no_claim_bonus_percent}% no-claim bonus reflects a clean claims history`, feature: "no_claim_bonus", weight: 0.1 });
  } else if (form.no_claim_bonus_percent === 0) {
    score += 5;
    riskFactors.push({ detail: "No no-claim bonus on record", feature: "no_claim_bonus", weight: 0.05 });
  }

  // Prior accident / claim
  if (form.prior_accident_claim === 1) {
    score += 20;
    riskFactors.push({ detail: "Accident or claim reported in the last 3 years", feature: "prior_accident_claim", weight: 0.2 });
  } else {
    positiveFactors.push({ detail: "No accidents or claims in the last 3 years", feature: "prior_accident_claim", weight: 0.12 });
  }

  // Commercial use
  if (form.commercial_use === 1) {
    score += 12;
    riskFactors.push({ detail: "Vehicle used commercially, increasing road exposure", feature: "commercial_use", weight: 0.12 });
  }

  // Previous claims count
  if (form.num_previous_claims >= 2) {
    score += 10;
    riskFactors.push({ detail: `${form.num_previous_claims} previous claims on record`, feature: "previous_claims", weight: 0.1 });
  }

  // Years with insurer
  if (form.years_with_insurer >= 5) {
    score -= 5;
    positiveFactors.push({ detail: "Long-standing relationship with current insurer", feature: "years_with_insurer", weight: 0.05 });
  }

  // Credit score
  if (form.credit_score >= 750) {
    score -= 5;
    positiveFactors.push({ detail: "Strong credit score", feature: "credit_score", weight: 0.05 });
  } else if (form.credit_score > 0 && form.credit_score < 600) {
    score += 5;
    riskFactors.push({ detail: "Below-average credit score", feature: "credit_score", weight: 0.05 });
  }

  score = Math.max(5, Math.min(95, Math.round(score)));

  return {
    risk_score: score,
    confidence: 80 + (score % 15),
    reasoning_summary:
      "Simulated assessment based on vehicle age, driver experience, claims history, and usage pattern. This is placeholder logic running entirely in the browser — swap in the real model once the backend endpoint is ready.",
    risk_factors: riskFactors.length ? riskFactors : [{ detail: "No significant risk factors identified", feature: "overall", weight: 0.05 }],
    positive_factors: positiveFactors.length ? positiveFactors : [{ detail: "No notable positive factors identified", feature: "overall", weight: 0.05 }],
  };
}

// Runs every vehicle in a fleet through the scorer and produces a fleet-level
// summary (average score, worst vehicle, count of vehicles needing review).
export function getDummyFleetRiskResult(vehicles) {
  const results = vehicles.map((v) => ({
    vehicle: v,
    result: getDummyMotorRiskResult(v),
  }));

  const avgScore = Math.round(
    results.reduce((sum, r) => sum + r.result.risk_score, 0) / results.length
  );

  const highestRisk = results.reduce((max, r) =>
    r.result.risk_score > max.result.risk_score ? r : max
  , results[0]);

  return {
    fleet_risk_score: avgScore,
    vehicle_count: vehicles.length,
    highest_risk_vehicle: highestRisk.vehicle,
    vehicles_needing_review: results.filter((r) => r.result.risk_score >= 60).length,
    per_vehicle: results,
  };
}
