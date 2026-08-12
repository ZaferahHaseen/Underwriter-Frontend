import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaChartLine,
  FaCarSide,
  FaShieldAlt,
  FaUserTie,
  FaGasPump,
  FaRoad,
  FaChevronDown,
} from "react-icons/fa";
import "./MotorProposalDetails.css";
import { getDummyMotorProposal } from "../../../api/dummyMotorProposals";
import BackButton from "../../../components/BackButton";
import TopBar from "../../../components/TopBar";

// Flip to false once the backend teammate's motor proposal endpoint is live.
const USE_DUMMY_DATA = true;

function MotorProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVehicleId, setExpandedVehicleId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (USE_DUMMY_DATA) {
      const p = getDummyMotorProposal(id);
      setProposal(p);
      setExpandedVehicleId(p.vehicles[0]?.vehicle_id ?? null);
      setLoading(false);
      return;
    }
    // Real endpoint wiring goes here once ready, e.g. getMotorProposal(id).
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="mpd-page">
        <BackButton to="/underwriter/motor/dashboard" />
        <p className="state-text">Loading fleet details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mpd-page">
        <BackButton to="/underwriter/motor/dashboard" />
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

  const initials = (proposal.full_name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="mpd-page">
      <div className="mpd-hero">
        <div className="mpd-header">
          <BackButton to="/underwriter/motor/dashboard" />
          <div className="mpd-avatar">{initials}</div>
          <div className="mpd-header-text">
            <h1>{proposal.full_name}</h1>
            <p className="mpd-subhead">
              {proposal.insurance_type} · {proposal.fleet_type} · Reference #{proposal.id} · Submitted {proposal.created_at}
            </p>
          </div>

          {/* Document Verification + AI Risk Analysis now live at the top,
              replacing the old pending/approved/rejected status stamp. */}
          <div className="mpd-hero-actions">
            <button
              className="mpd-action-btn mpd-action-secondary"
              onClick={() => navigate(`/motor-document-verification/${id}`)}
            >
              <FaFileAlt />
              Document Verification
            </button>

            <button
              className="mpd-action-btn mpd-action-primary"
              onClick={() => navigate(`/motor-risk-analysis/${id}`)}
            >
              <FaChartLine />
              AI Risk Analysis
            </button>
          </div>

          <TopBar homeTo="/underwriter/home" />
        </div>
      </div>

      <div className="mpd-cards">
        {highlights.map((h) => (
          <div className="mpd-stat-card" key={h.label}>
            <div className={`mpd-stat-icon mpd-stat-icon-${h.tone}`}>{h.icon}</div>
            <div>
              <h2 className="mono">{h.value}</h2>
              <p>{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mpd-panel mpd-scroll-panel">
        <section className="mpd-section">
          <div className="mpd-section-head">
            <FaUserTie className="mpd-section-icon" />
            <h3>Policyholder Profile</h3>
          </div>
          <div className="mpd-grid">
            <div className="mpd-field">
              <span className="mpd-field-label">Occupation</span>
              <span className="mpd-field-value">{proposal.occupation}</span>
            </div>
            <div className="mpd-field">
              <span className="mpd-field-label">Annual Income</span>
              <span className="mpd-field-value">₹{Number(proposal.annual_income).toLocaleString("en-IN")}</span>
            </div>
            <div className="mpd-field">
              <span className="mpd-field-label">Credit Score</span>
              <span className="mpd-field-value">{proposal.credit_score}</span>
            </div>
            <div className="mpd-field">
              <span className="mpd-field-label">Years With Insurer</span>
              <span className="mpd-field-value">{proposal.years_with_insurer}</span>
            </div>
          </div>
        </section>

        <section className="mpd-section mpd-section-last">
          <div className="mpd-section-head">
            <FaCarSide className="mpd-section-icon" />
            <h3>Vehicle{vehicleCount > 1 ? "s" : ""} on this Policy</h3>
          </div>

          {/* ---- Fleet summary table ---- */}
          <div className="mpd-vehicle-table-wrap">
            <table className="mpd-vehicle-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Vehicle Age</th>
                  <th>Vehicle Value</th>
                  <th>Driver Age</th>
                  <th>Previous Accidents</th>
                  <th>Previous Claims</th>
                  <th>Annual Mileage</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {proposal.vehicles.map((v) => {
                  const isOpen = v.vehicle_id === expandedVehicleId;
                  return (
                    <tr
                      key={v.vehicle_id}
                      className={isOpen ? "mpd-vt-row mpd-vt-row-active" : "mpd-vt-row"}
                      onClick={() => setExpandedVehicleId(isOpen ? null : v.vehicle_id)}
                    >
                      <td>
                        <span className="mpd-vt-vehicle">
                          <FaCarSide /> {v.vehicle_make} {v.vehicle_model}
                        </span>
                        <span className="mpd-vt-reg mono">{v.registration_number}</span>
                      </td>
                      <td className="mono">{v.vehicle_age_years} yrs</td>
                      <td className="mono">₹{v.idv.toLocaleString("en-IN")}</td>
                      <td className="mono">{v.driver_age}</td>
                      <td className="mono">{v.previous_accidents}</td>
                      <td className="mono">{v.num_previous_claims}</td>
                      <td className="mono">{v.annual_mileage_km.toLocaleString("en-IN")} km</td>
                      <td className="mpd-vt-chevron">
                        <FaChevronDown className={isOpen ? "open" : ""} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ---- Full detail for the selected vehicle ---- */}
          {proposal.vehicles
            .filter((v) => v.vehicle_id === expandedVehicleId)
            .map((v) => (
              <div className="mpd-vehicle-detail" key={v.vehicle_id}>
                <div className="mpd-vehicle-detail-top">
                  <div>
                    <h4>{v.vehicle_make} {v.vehicle_model} · {v.vehicle_year}</h4>
                    <p className="mono">{v.registration_number}</p>
                  </div>
                  <span className={`mdash-status-pill mdash-status-${v.status.toLowerCase()}`}>{v.status}</span>
                </div>
                <div className="mpd-grid">
                  <div className="mpd-field">
                    <span className="mpd-field-label"><FaGasPump /> Fuel Type</span>
                    <span className="mpd-field-value">{v.fuel_type}</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Usage</span>
                    <span className="mpd-field-value">{v.vehicle_usage}</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Driving Experience</span>
                    <span className="mpd-field-value">{v.driving_experience_years} yrs</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">No-Claim Bonus</span>
                    <span className="mpd-field-value">{v.no_claim_bonus_percent}%</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Prior Accident/Claim Flag</span>
                    <span className="mpd-field-value">{v.prior_accident_claim ? "Yes" : "No"}</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Years With Insurer</span>
                    <span className="mpd-field-value">{v.years_with_insurer}</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Credit Score</span>
                    <span className="mpd-field-value">{v.credit_score}</span>
                  </div>
                  <div className="mpd-field">
                    <span className="mpd-field-label">Insured Declared Value</span>
                    <span className="mpd-field-value">₹{v.idv.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
}

export default MotorProposalDetails;
