const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

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