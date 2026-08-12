import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaShieldAlt, FaSignOutAlt, FaCarSide, FaCalendarAlt,
  FaCoins, FaUserAlt, FaEnvelope, FaPlus, FaGasPump,
} from "react-icons/fa";
import "./ClientMotorPolicy.css";
import { getMockMotorData } from "../../data/mockMotorPolicies";
import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";

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

function ClientMotorPolicy() {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem("client_email");
    if (!email) {
      // No session yet (brand-new client, arrived via Client Home without
      // logging in with an email) — just show the empty state below
      // instead of bouncing back to login.
      setLoading(false);
      return;
    }

    // TODO: swap for the real motor API once the backend is ready.
    // Shape matches getMockMotorData(): { client, vehicles }
    const data = getMockMotorData(email);
    setClient(data.client);
    setVehicles(data.vehicles || []);
    if (data.vehicles?.length > 0) setSelectedId(data.vehicles[0].id);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("client_email");
    sessionStorage.removeItem("client_login_data");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="cm-page cm-center">
        <p className="cm-loading">Loading your vehicle details…</p>
      </div>
    );
  }

  const initials = (client?.full_name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const selectedVehicle = vehicles.find((v) => v.id === selectedId) || null;

  return (
    <div className="cm-page">
      {/* ---- Hero header ---- */}
      <div className="cm-hero">
        <div className="cm-topbar">
          <div className="cm-topbar-left">
            <BackButton to="/client/home" />
            <div className="cm-brand">
              <FaShieldAlt />
              <span>AI Underwriter</span>
            </div>
          </div>
          <div className="cm-topbar-actions">
            <button className="cm-apply-btn" onClick={() => navigate("/client/motor/proposal")}>
              <FaPlus /> <span>Proposal Application</span>
            </button>
            <TopBar homeTo="/client/home" />
          </div>
        </div>

        <div className="cm-identity">
          <div className="cm-avatar">{initials}</div>
          <div>
            <h1>Welcome back{client?.full_name ? `, ${client.full_name}` : ""}</h1>
            <p>{client?.email}</p>
          </div>
        </div>
      </div>

      <div className="cm-body">
        {vehicles.length === 0 && (
          <div className="cm-empty">
            <FaCarSide className="cm-empty-icon" />
            <h2>No Vehicle Policy Yet</h2>
            <p>Submit a proposal for your vehicle to get started — one vehicle, or a whole fleet.</p>
            <button className="cm-empty-btn" onClick={() => navigate("/client/motor/proposal")}>
              Submit a Proposal
            </button>
          </div>
        )}

        {vehicles.length > 0 && (
          <div className={`cm-layout ${vehicles.length > 1 ? "cm-layout-with-list" : ""}`}>
            {vehicles.length > 1 && (
              <aside className="cm-policy-list">
                <span className="cm-policy-list-title">Your Vehicles</span>
                {vehicles.map((v) => (
                  <button
                    key={v.id}
                    className={`cm-policy-item ${v.id === selectedId ? "cm-policy-item-active" : ""}`}
                    onClick={() => setSelectedId(v.id)}
                  >
                    <span className="cm-policy-item-type">{v.make} {v.model}</span>
                    <span className="cm-policy-item-number mono">{v.policy_number}</span>
                    <span className={`cm-status-pill ${statusTone(v.status)}`}>{v.status}</span>
                  </button>
                ))}
              </aside>
            )}

            {selectedVehicle && (
              <div className="cm-detail">
                {/* Policy summary card */}
                <section className="cm-card cm-policy-card">
                  <div className="cm-policy-card-head">
                    <div>
                      <span className="cm-eyebrow">Vehicle Policy</span>
                      <h2>{selectedVehicle.make} {selectedVehicle.model} <span className="cm-year">({selectedVehicle.year})</span></h2>
                      <p className="mono cm-policy-number">{selectedVehicle.policy_number}</p>
                    </div>
                    <span className={`cm-status-pill cm-status-pill-lg ${statusTone(selectedVehicle.status)}`}>
                      {selectedVehicle.status}
                    </span>
                  </div>

                  <div className="cm-stat-grid">
                    <div className="cm-stat">
                      <span className="cm-stat-icon"><FaCoins /></span>
                      <div>
                        <span className="cm-stat-label">Insured Value (IDV)</span>
                        <span className="cm-stat-value">{formatMoney(selectedVehicle.idv)}</span>
                      </div>
                    </div>

                    {selectedVehicle.premium != null && (
                      <div className="cm-stat">
                        <span className="cm-stat-icon"><FaCoins /></span>
                        <div>
                          <span className="cm-stat-label">Premium</span>
                          <span className="cm-stat-value">{formatMoney(selectedVehicle.premium)}</span>
                        </div>
                      </div>
                    )}

                    <div className="cm-stat">
                      <span className="cm-stat-icon"><FaCalendarAlt /></span>
                      <div>
                        <span className="cm-stat-label">Issued On</span>
                        <span className="cm-stat-value">{selectedVehicle.issue_date || "—"}</span>
                      </div>
                    </div>

                    <div className="cm-stat">
                      <span className="cm-stat-icon"><FaCalendarAlt /></span>
                      <div>
                        <span className="cm-stat-label">Valid Until</span>
                        <span className="cm-stat-value">{selectedVehicle.expiry_date || "—"}</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vehicle + owner details */}
                <section className="cm-card">
                  <div className="cm-card-head">
                    <h3>Vehicle & Owner Details</h3>
                  </div>
                  <div className="cm-info-grid">
                    <div className="cm-info-row">
                      <span className="cm-info-icon"><FaCarSide /></span>
                      <span className="cm-info-label">Registration No.</span>
                      <span className="cm-info-value">{selectedVehicle.registration_number || "—"}</span>
                    </div>
                    <div className="cm-info-row">
                      <span className="cm-info-icon"><FaGasPump /></span>
                      <span className="cm-info-label">Vehicle Type</span>
                      <span className="cm-info-value">{selectedVehicle.vehicle_type || "—"}</span>
                    </div>
                    <div className="cm-info-row">
                      <span className="cm-info-icon"><FaUserAlt /></span>
                      <span className="cm-info-label">Owner Name</span>
                      <span className="cm-info-value">{client?.full_name || "—"}</span>
                    </div>
                    <div className="cm-info-row">
                      <span className="cm-info-icon"><FaEnvelope /></span>
                      <span className="cm-info-label">Email</span>
                      <span className="cm-info-value">{client?.email || "—"}</span>
                    </div>
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

export default ClientMotorPolicy;