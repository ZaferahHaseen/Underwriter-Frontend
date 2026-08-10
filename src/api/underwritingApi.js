const API_BASE =
  import.meta.env.VITE_API_BASE || "http://192.168.1.3:8000";
export { API_BASE };
export async function getUnderwritingDecision(applicant) {
  const res = await fetch(`${API_BASE}/api/v1/underwrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicant),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getUnderwritingFromProposal(rawProposal) {
  const res = await fetch(`${API_BASE}/api/v1/underwrite/from-proposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rawProposal),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Client: submit proposal + attached document in ONE multipart request.
// `payload` = plain field object, `file` = the attached document (required).
//
// Fields sent for EVERY insurance_type ("Health Insurance" | "Life Insurance" | "Vehicle Insurance"):
//   full_name, insurance_type, age, annual_income, sum_assured, occupation,
//   credit_score, num_previous_claims, years_with_insurer, country_code, doc_type
//
// Extra fields when insurance_type === "Vehicle Insurance":
//   vehicle_make, vehicle_model, vehicle_year, registration_number, fuel_type
//   ("petrol" | "diesel" | "electric" | "cng" | "hybrid"), vehicle_usage
//   ("personal" | "commercial"), driving_experience_years, no_claim_bonus_percent,
//   prior_accident_claim ("yes" | "no")
//   (note: sum_assured is used as the vehicle's Insured Declared Value / IDV here)
//
// Extra fields for "Health Insurance" / "Life Insurance":
//   height_cm, weight_kg, smoker ("yes"|"no"), alcohol_consumption
//   ("none"|"occasional"|"regular"), pre_existing_disease ("yes"|"no"),
//   family_medical_history ("yes"|"no")
export async function submitProposal(payload, file) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));

  const res = await fetch(`${API_BASE}/api/v1/proposals`, {
    method: "POST",
    body: form, // no Content-Type - browser sets multipart boundary
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}

// Multi-country ID support: fetch supported country+doc combos for dropdown
export async function getSupportedDocuments() {
  const res = await fetch(`${API_BASE}/api/v1/supported-documents`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
// Two-step country/doc-type dropdowns
export async function getCountries() {
  const res = await fetch(`${API_BASE}/api/v1/countries`);
  if (!res.ok) throw new Error("Failed to load countries");
  const data = await res.json();
  return data.countries || [];
}

export async function getDocTypesForCountry(countryCode) {
  const res = await fetch(`${API_BASE}/api/v1/countries/${countryCode}/doc-types`);
  if (!res.ok) throw new Error("Failed to load document types");
  const data = await res.json();
  return data.doc_types || [];
} 

export async function listProposals() {
  const res = await fetch(`${API_BASE}/api/v1/proposals`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getProposal(id) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function decideProposal(id, status) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: build a URL to view/download the attached document
export function getProposalDocumentUrl(id) {
  return `${API_BASE}/api/v1/proposals/${id}/document`;
}

// ---------------------------------------------------------------------------
// Client login → "My Policy" page
//
// Frontend contract for the backend (email validation + data lookup):
//   POST /api/v1/client/login
//   body: { "email": "someone@example.com" }
//
// Expected 200 response shape:
//   {
//     "client": {
//       "full_name": "Jane Doe",
//       "email": "someone@example.com",
//       "age": 34,                     // optional
//       "occupation": "office"         // optional
//     },
//     "policies": [
//       {
//         "id": 12,
//         "policy_number": "POL-2026-0012",
//         "insurance_type": "Health Insurance",
//         "status": "Active",          // Active | Expired | Lapsed | Pending
//         "sum_assured": 500000,
//         "premium": 8400,             // optional
//         "issue_date": "2026-02-10",
//         "expiry_date": "2027-02-09"
//       }
//     ]
//   }
//
// If the email has no policy yet, return "policies": [] with a 200 (not a 404) —
// the frontend renders a friendly empty state for that case.
// If the email itself isn't found/valid, return a 4xx with { "detail": "..." }.
// ---------------------------------------------------------------------------
export async function clientLogin(email) {
  const res = await fetch(`${API_BASE}/api/v1/client/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}