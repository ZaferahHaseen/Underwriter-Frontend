const API_BASE = "http://192.168.1.44:8000";

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