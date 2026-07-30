// Reads from .env / .env.local (VITE_API_BASE=http://your-ip:8000).
// Falls back to the previous hardcoded LAN IP so nothing breaks if no .env is set yet.
const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function getUnderwritingDecision(applicant) {
  const res = await fetch(`${API_BASE}/api/v1/underwrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicant),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
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

// Client: submit proposal. Backend runs AI silently, stores result, returns only id+status.
export async function submitProposal(payload) {
  const res = await fetch(`${API_BASE}/api/v1/proposals`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: list all submitted proposals
export async function listProposals() {
  const res = await fetch(`${API_BASE}/api/v1/proposals`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: full detail incl AI verdict for one proposal
export async function getProposal(id) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: approve or reject
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
// Client: upload ID/certificate for OCR extraction + validation
export async function validateCertificate(file, statedCategory) {
  const form = new FormData();
  form.append("file", file);
  if (statedCategory) form.append("stated_category", statedCategory);

  const res = await fetch(`${API_BASE}/api/v1/validate-certificate`, {
    method: "POST",
    body: form, // no Content-Type header - browser sets multipart boundary automatically
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}