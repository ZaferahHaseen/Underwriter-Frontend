const API_BASE =
  import.meta.env.VITE_API_BASE || "http://192.168.1.3:8000";
export { API_BASE };

// ---------------------------------------------------------------------------
// AUTH / TOKEN STORAGE
// Real JWT auth (app/auth/router.py). Token + role + name kept in
// localStorage so a refresh doesn't log the user out.
// ---------------------------------------------------------------------------
const TOKEN_KEY = "uw_token";
const ROLE_KEY = "uw_role";
const NAME_KEY = "uw_full_name";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function getFullName() {
  return localStorage.getItem(NAME_KEY);
}

function setAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.access_token);
  localStorage.setItem(ROLE_KEY, data.role);
  localStorage.setItem(NAME_KEY, data.full_name);
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
}

// Attach to every authenticated call. Spread this into `headers`.
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- Login / Signup (Login.jsx calls these) ----
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  const data = await res.json();
  setAuth(data);
  return data;
}

export async function signup(fullName, email, password, role) {
  const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  const data = await res.json();
  setAuth(data);
  return data;
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ---------------------------------------------------------------------------
export async function getUnderwritingDecision(applicant) {
  const res = await fetch(`${API_BASE}/api/v1/underwrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(applicant),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getUnderwritingFromProposal(rawProposal) {
  const res = await fetch(`${API_BASE}/api/v1/underwrite/from-proposal`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(rawProposal),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Client: submit proposal + attached document in ONE multipart request.
// full_name is now taken from the JWT on the backend, not sent from here.
export async function submitProposal(payload, file) {
  const form = new FormData();
  form.append("file", file);
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));

  const res = await fetch(`${API_BASE}/api/v1/proposals`, {
    method: "POST",
    headers: { ...authHeaders() }, // no Content-Type - browser sets multipart boundary
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}

// Client: edit + resubmit a proposal (creates a new version, no file re-upload).
export async function editProposal(proposalId, payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));

  const res = await fetch(`${API_BASE}/api/v1/proposals/${proposalId}/edit`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}

// Multi-country ID support: fetch supported country+doc combos for dropdown (public)
export async function getSupportedDocuments() {
  const res = await fetch(`${API_BASE}/api/v1/supported-documents`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
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
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getProposal(id) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function decideProposal(id, status) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: build a URL to view/download the attached document.
// <a href>/<img src> can't send an Authorization header, so the JWT rides
// along as ?token= (backend's get_current_user accepts either — see
// app/auth/dependencies.py).
export function getProposalDocumentUrl(id) {
  const token = getToken();
  return `${API_BASE}/api/v1/proposals/${id}/document${token ? `?token=${token}` : ""}`;
}

// ---------------------------------------------------------------------------
// Client: "My Policy" page — real backend, JWT-identified (app/client_router.py)
// ---------------------------------------------------------------------------
export async function getMyPolicies() {
  const res = await fetch(`${API_BASE}/api/v1/client/my-policies`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

export async function getMyVehiclePolicies() {
  const res = await fetch(`${API_BASE}/api/v1/client/my-vehicle-policies`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// VEHICLE (Motor) endpoints
// ---------------------------------------------------------------------------
export async function submitVehicleProposalsBatch(vehicles) {
  const res = await fetch(`${API_BASE}/api/v1/vehicle/proposals/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(vehicles),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}

export async function listVehicleProposals() {
  const res = await fetch(`${API_BASE}/api/v1/vehicle/proposals`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getVehicleProposal(id) {
  const res = await fetch(`${API_BASE}/api/v1/vehicle/proposals/${id}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Underwriter: single-vehicle edit (backend: app/vehicle/router.py edit_vehicle_proposal).
// Not wired into any page yet (no Motor edit UI exists) — exported so it's
// ready to use the moment such a screen is added.
export async function editVehicleProposal(id, payload) {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => form.append(key, value));

  const res = await fetch(`${API_BASE}/api/v1/vehicle/proposals/${id}/edit`, {
    method: "POST",
    headers: { ...authHeaders() }, // multipart Form fields, no file
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}

// Fleet aggregate view (app/vehicle/batch_router.py get_fleet_proposal) —
// used by motorAdapter.js whenever the route id is a fleet_group_id (UUID).
export async function getFleetProposal(fleetGroupId) {
  const res = await fetch(`${API_BASE}/api/v1/vehicle/fleet/${fleetGroupId}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter: build a URL to view/download the vehicle proposal's attached
// document. Bulk/batch-created proposals have no document -> this 404s for those.
export function getVehicleProposalDocumentUrl(id) {
  const token = getToken();
  return `${API_BASE}/api/v1/vehicle/proposals/${id}/document${token ? `?token=${token}` : ""}`;
}

// Decision endpoint is SHARED with the life module (generic status UPDATE).
export async function decideVehicleProposal(id, status) {
  const res = await fetch(`${API_BASE}/api/v1/proposals/${id}/decision`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

// Underwriter Motor Quick Check (RiskAnalysis.jsx, checkType==='motor') —
// hits the real model via app/vehicle/quick_router.py instead of the local
// dummy scorer.
export async function quickMotorUnderwrite(payload) {
  const res = await fetch(`${API_BASE}/api/v1/vehicle/underwrite`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ? JSON.stringify(err.detail) : `API error: ${res.status}`);
  }
  return res.json();
}