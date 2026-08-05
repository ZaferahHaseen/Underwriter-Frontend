const API_BASE =
  import.meta.env.VITE_API_BASE || "http://192.168.1.3:8000";
export { API_BASE };

// Attaches the saved JWT to every protected call. Reads straight from
// localStorage (not React state) since this file is plain JS, outside
// any component/context tree.
function authHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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
// full_name is no longer sent — backend derives it from the logged-in token.
export async function submitProposal(payload, file) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));

  const res = await fetch(`${API_BASE}/api/v1/proposals`, {
    method: "POST",
    headers: { ...authHeader() }, // no Content-Type - browser sets multipart boundary
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.detail
      ? (typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail))
      : `API error: ${res.status}`;
    const e = new Error(message);
    e.status = res.status; // lets callers branch on 409 (duplicate pending proposal) etc.
    throw e;
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
  const res = await fetch(`${API_BASE}/api/v1/proposals`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getProposal(id) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function decideProposal(id, status) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: build a URL to view/download the attached document.
// Note: this URL is now auth-protected on the backend — if used directly
// in an <img>/<a> tag (no header attach possible there), it will 401.
// Fetch it via JS with authHeader() instead if you need the raw bytes.
export function getProposalDocumentUrl(id) {
  return `${API_BASE}/api/v1/proposals/${id}/document`;
}

export async function fetchProposalDocumentBlob(id) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}/document`, {
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.blob();
}