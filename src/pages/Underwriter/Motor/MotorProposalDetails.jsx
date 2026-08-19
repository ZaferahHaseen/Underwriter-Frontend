import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaChartLine,
  FaCarSide,
  FaShieldAlt,
  FaUserTie,
  FaRoad,
  FaSearch,
  FaChevronRight,
} from "react-icons/fa";
import "./MotorProposalDetails.css";
import { getMotorProposal } from "../../../api/motorAdapter";
import PageHeader from "../../../components/PageHeader";
import { formatName, formatField, formatCurrency, formatNumber } from "../../../utils/format";

// WIRED TO BACKEND via api/motorAdapter.js (GET /api/v1/vehicle/proposals/:id
// or GET /api/v1/vehicle/fleet/:id depending on whether :id is a fleet_group_id).
function MotorProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);

    getMotorProposal(id)
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mpd-page">
        <PageHeader theme="motor" title="Motor Proposal" backTo="/underwriter/motor/dashboard" homeTo="/underwriter/home" compact />
        <p className="state-text">Loading fleet details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mpd-page">
        <PageHeader theme="motor" title="Motor Proposal" backTo="/underwriter/motor/dashboard" homeTo="/underwriter/home" compact />
        <p className="state-text error-text">Error: {error}</p>
      </div>
    );
  }

  if (!proposal) return null;

  const vehicleCount = proposal.vehicles.length;
  const totalIdv = proposal.vehicles.reduce((sum, v) => sum + v.idv, 0);
  const flaggedVehicles = proposal.vehicles.filter((v) => v.status === "PENDING" || v.status === "REJECTED").length;

  const highlights = [
    { label: "Policyholder Type", value: proposal.fleet_type, icon: <FaUserTie />, tone: "motor" },
    { label: "Vehicles Insured", value: vehicleCount, icon: <FaCarSide />, tone: "gold" },
    { label: "Total Insured Value", value: `₹${totalIdv.toLocaleString("en-IN")}`, icon: <FaShieldAlt />, tone: "low" },
    { label: "Flagged Vehicles", value: flaggedVehicles, icon: <FaRoad />, tone: "high" },
  ];

  const displayName = formatName(proposal.full_name);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

  const filteredVehicles = proposal.vehicles.filter((v) =>
    `${v.vehicle_make} ${v.vehicle_model}`.toLowerCase().includes(query.toLowerCase()) ||
    v.registration_number?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mpd-page">
      <PageHeader
        theme="motor"
        avatar={initials}
        title={displayName}
        subtitle={`${proposal.insurance_type} · ${proposal.fleet_type} · Reference #${proposal.id} · Submitted ${proposal.created_at}`}
        backTo="/underwriter/motor/dashboard"
        homeTo="/underwriter/home"
        actions={
          <>
            <button
              className="ph-header-btn"
              onClick={() => navigate(`/motor-document-verification/${id}`)}
            >
              <FaFileAlt />
              Document Verification
            </button>

            <button
              className="ph-header-btn ph-header-btn-primary"
              onClick={() => navigate(`/motor-risk-analysis/${id}`)}
            >
              <FaChartLine />
              AI Risk Analysis
            </button>
          </>
        }
      />

      <div className="mpd-cards">
        {highlights.map((h) => (
          <div className="mpd-stat-card" key={h.label}>
            <div className={`mpd-stat-icon mpd-stat-icon-${h.tone}${h.value === 0 ? " mpd-stat-icon-muted" : ""}`}>
              {h.icon}
            </div>
            <div>
              <h2 className="mono">{h.value}</h2>
              <p>{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mpd-scroll-panel">
        {/* ---- Policyholder profile ---- */}
        <section className="mpd-panel mpd-profile-panel">
          <div className="mpd-section">
            <div className="mpd-section-head">
              <FaUserTie className="mpd-section-icon" />
              <h3>Policyholder Profile</h3>
            </div>
            <div className="mpd-grid">
              <div className="mpd-field">
                <span className="mpd-field-label">Occupation</span>
                <span className={`mpd-field-value${!proposal.occupation ? " mpd-field-empty" : ""}`}>
                  {formatField(proposal.occupation, "Not provided")}
                </span>
              </div>
              <div className="mpd-field">
                <span className="mpd-field-label">Annual Income</span>
                <span className={`mpd-field-value${!proposal.annual_income ? " mpd-field-empty" : ""}`}>
                  {formatCurrency(proposal.annual_income, { treatZeroAsMissing: true, fallback: "Not disclosed" })}
                </span>
              </div>
              <div className="mpd-field">
                <span className="mpd-field-label">Credit Score</span>
                <span className={`mpd-field-value${!proposal.credit_score ? " mpd-field-empty" : ""}`}>
                  {formatNumber(proposal.credit_score, "Not available")}
                </span>
              </div>
              <div className="mpd-field">
                <span className="mpd-field-label">Years With Insurer</span>
                <span className={`mpd-field-value${!proposal.years_with_insurer ? " mpd-field-empty" : ""}`}>
                  {formatNumber(proposal.years_with_insurer, "New customer")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Vehicles — styled like the Motor Insurance Dashboard list ---- */}
        <div className="mpd-list-panel">
          <div className="mpd-list-panel-header">
            <h2>Vehicle{vehicleCount > 1 ? "s" : ""} on this Policy</h2>
            <div className="mpd-search-box">
              <FaSearch />
              <input
                placeholder="Search by make, model, or registration no."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mpd-list-scroll">
            <div className="mpd-row mpd-row-head">
              <span className="mpd-col mpd-col-vehicle">Vehicle</span>
              <span className="mpd-col mpd-col-idv">Insured Value</span>
              <span className="mpd-col mpd-col-driver">Driver Age</span>
              <span className="mpd-col mpd-col-claims">Prev. Claims</span>
              <span className="mpd-col mpd-col-status">Status</span>
              <span className="mpd-col mpd-col-action"></span>
            </div>

            {filteredVehicles.length === 0 ? (
              <p className="empty-row">No vehicles match your search.</p>
            ) : (
              filteredVehicles.map((v) => (
                <div
                  className="mpd-row"
                  key={v.vehicle_id}
                  onClick={() => navigate(`/motor-proposal/${id}/vehicle/${v.vehicle_id}`)}
                >
                  <span className="mpd-col mpd-col-vehicle">
                    <span className="mpd-vt-vehicle">
                      <FaCarSide /> {v.vehicle_make} {v.vehicle_model}
                    </span>
                    <span className={`mpd-vt-reg mono${!v.registration_number ? " mpd-field-empty" : ""}`}>
                      {formatField(v.registration_number, "Registration pending")}
                    </span>
                  </span>
                  <span className="mpd-col mpd-col-idv mono">₹{v.idv.toLocaleString("en-IN")}</span>
                  <span className="mpd-col mpd-col-driver mono">{v.driver_age}</span>
                  <span className="mpd-col mpd-col-claims mono">{v.num_previous_claims}</span>
                  <span className="mpd-col mpd-col-status">
                    <span className={`mdash-status-pill mdash-status-${v.status.toLowerCase()}`}>{v.status}</span>
                  </span>
                  <span className="mpd-col mpd-col-action">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/motor-proposal/${id}/vehicle/${v.vehicle_id}`);
                      }}
                    >
                      View <FaChevronRight />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotorProposalDetails;