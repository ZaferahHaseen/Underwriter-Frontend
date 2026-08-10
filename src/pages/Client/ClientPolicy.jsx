import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt, FaSignOutAlt, FaFileContract, FaCalendarAlt,
  FaCoins, FaUserAlt, FaEnvelope, FaBriefcase,
} from "react-icons/fa";
import "./ClientPolicy.css";
import { clientLogin } from "../../api/underwritingApi";

function statusTone(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "tone-active";
  if (s.includes("pending")) return "tone-pending";
  if (s.includes("expired") || s.includes("lapsed")) return "tone-expired";
  return "tone-pending";
}

function formatMoney(n) {
  if (n === null || n === undefined || n === "") return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function ClientPolicy() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = sessionStorage.getItem("client_email");
    if (!email) {
      navigate("/");
      return;
    }

    // Use the data captured at login if we have it (avoids a duplicate call
    // on first load), otherwise re-fetch — this keeps a page refresh working.
    const cached = sessionStorage.getItem("client_login_data");
    if (cached) {
      try {
        const data = JSON.parse(cached);
        applyData(data);
        setLoading(false);
        return;
      } catch {
        // fall through to re-fetch
      }
    }

    clientLogin(email)
      .then(applyData)
      .catch((err) => setError(err.message || "Couldn't load your policy."))
      .finally(() => setLoading(false));

    function applyData(data) {
      setClient(data.client || null);
      const list = data.policies || [];
      setPolicies(list);
      if (list.length > 0) setSelectedId(list[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("client_email");
    sessionStorage.removeItem("client_login_data");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="cp-page cp-center">
        <p className="cp-loading">Loading your policy…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-page cp-center">
        <div className="cp-error-card">
          <p>{error}</p>
          <button onClick={handleLogout}>Back to Login</button>
        </div>
      </div>
    );
  }

  const initials = (client?.full_name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const selectedPolicy = policies.find((p) => p.id === selectedId) || null;

  return (
    <div className="cp-page">
      {/* ---- Hero header ---- */}
      <div className="cp-hero">
        <div className="cp-topbar">
          <div className="cp-brand">
            <FaShieldAlt />
            <span>AI Underwriter</span>
          </div>
          <button className="cp-logout" onClick={handleLogout}>
            <FaSignOutAlt /> Log out
          </button>
        </div>

        <div className="cp-identity">
          <div className="cp-avatar">{initials}</div>
          <div>
            <h1>Welcome back{client?.full_name ? `, ${client.full_name}` : ""}</h1>
            <p>{client?.email}</p>
          </div>
        </div>
      </div>

      <div className="cp-body">
        {policies.length === 0 && (
          <div className="cp-empty">
            <FaFileContract className="cp-empty-icon" />
            <h2>No Active Policy Yet</h2>
            <p>Once a proposal is approved, it'll show up here as an active policy.</p>
            <button className="cp-empty-btn" onClick={() => navigate("/client/dashboard")}>
              Submit a New Proposal
            </button>
          </div>
        )}

        {policies.length > 0 && (
          <div className={`cp-layout ${policies.length > 1 ? "cp-layout-with-list" : ""}`}>
            {/* Policy switcher — only shown when there's more than one */}
            {policies.length > 1 && (
              <aside className="cp-policy-list">
                <span className="cp-policy-list-title">Your Policies</span>
                {policies.map((p) => (
                  <button
                    key={p.id}
                    className={`cp-policy-item ${p.id === selectedId ? "cp-policy-item-active" : ""}`}
                    onClick={() => setSelectedId(p.id)}
                  >
                    <span className="cp-policy-item-type">{p.insurance_type}</span>
                    <span className="cp-policy-item-number mono">{p.policy_number}</span>
                    <span className={`cp-status-pill ${statusTone(p.status)}`}>{p.status}</span>
                  </button>
                ))}
              </aside>
            )}

            {selectedPolicy && (
              <div className="cp-detail">
                {/* Policy summary card */}
                <section className="cp-card cp-policy-card">
                  <div className="cp-policy-card-head">
                    <div>
                      <span className="cp-eyebrow">Policy</span>
                      <h2>{selectedPolicy.insurance_type}</h2>
                      <p className="mono cp-policy-number">{selectedPolicy.policy_number}</p>
                    </div>
                    <span className={`cp-status-pill cp-status-pill-lg ${statusTone(selectedPolicy.status)}`}>
                      {selectedPolicy.status}
                    </span>
                  </div>

                  <div className="cp-stat-grid">
                    <div className="cp-stat">
                      <span className="cp-stat-icon"><FaCoins /></span>
                      <div>
                        <span className="cp-stat-label">Coverage Amount</span>
                        <span className="cp-stat-value">{formatMoney(selectedPolicy.sum_assured)}</span>
                      </div>
                    </div>

                    {selectedPolicy.premium != null && (
                      <div className="cp-stat">
                        <span className="cp-stat-icon"><FaCoins /></span>
                        <div>
                          <span className="cp-stat-label">Premium</span>
                          <span className="cp-stat-value">{formatMoney(selectedPolicy.premium)}</span>
                        </div>
                      </div>
                    )}

                    <div className="cp-stat">
                      <span className="cp-stat-icon"><FaCalendarAlt /></span>
                      <div>
                        <span className="cp-stat-label">Issued On</span>
                        <span className="cp-stat-value">{selectedPolicy.issue_date || "—"}</span>
                      </div>
                    </div>

                    <div className="cp-stat">
                      <span className="cp-stat-icon"><FaCalendarAlt /></span>
                      <div>
                        <span className="cp-stat-label">Valid Until</span>
                        <span className="cp-stat-value">{selectedPolicy.expiry_date || "—"}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Applicant details */}
                <section className="cp-card">
                  <div className="cp-card-head">
                    <h3>Your Details</h3>
                  </div>
                  <div className="cp-info-grid">
                    <div className="cp-info-row">
                      <span className="cp-info-icon"><FaUserAlt /></span>
                      <span className="cp-info-label">Full Name</span>
                      <span className="cp-info-value">{client?.full_name || "—"}</span>
                    </div>
                    <div className="cp-info-row">
                      <span className="cp-info-icon"><FaEnvelope /></span>
                      <span className="cp-info-label">Email</span>
                      <span className="cp-info-value">{client?.email || "—"}</span>
                    </div>
                    {client?.age != null && (
                      <div className="cp-info-row">
                        <span className="cp-info-icon"><FaUserAlt /></span>
                        <span className="cp-info-label">Age</span>
                        <span className="cp-info-value">{client.age}</span>
                      </div>
                    )}
                    {client?.occupation && (
                      <div className="cp-info-row">
                        <span className="cp-info-icon"><FaBriefcase /></span>
                        <span className="cp-info-label">Occupation</span>
                        <span className="cp-info-value">{client.occupation}</span>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientPolicy;
