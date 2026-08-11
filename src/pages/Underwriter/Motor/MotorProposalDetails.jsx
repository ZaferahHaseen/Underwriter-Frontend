import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCarSide,
  FaShieldAlt,
  FaUserTie,
  FaGasPump,
  FaCheckCircle,
  FaTimesCircle,
  FaChartLine,
} from "react-icons/fa";
import "./MotorProposalDetails.css";
import { getVehicleProposal, decideVehicleProposal, getVehicleProposalDocumentUrl } from "../../../api/underwritingApi";
import { FaFileAlt } from "react-icons/fa";
import BackButton from "../../../components/BackButton";
import StatusStamp from "../../../components/StatusStamp";

// Real backend wired -- one proposal = one vehicle (flat), no fleet nesting.
const USE_DUMMY_DATA = false;

function MotorProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deciding, setDeciding] = useState(false);

  const loadProposal = () => {
    setLoading(true);
    setError(null);
    getVehicleProposal(id)
      .then((data) => {
        setProposal(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setLoading(false);
      return;
    }
    loadProposal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDecision = async (status) => {
    setDeciding(true);
    try {
      await decideVehicleProposal(id, status);
      loadProposal(); // refresh to show new status
    } catch (err) {
      alert(`Decision failed: ${err.message}`);
    } finally {
      setDeciding(false);
    }
  };

  if (loading) {
    return (
      <div className="mpd-page">
        <BackButton to="/underwriter/motor/dashboard" />
        <p className="state-text">Loading vehicle details…</p>
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

  const v = proposal.vehicle || {};
  const raw = proposal.raw_input || {};

  const highlights = [
    { label: "Risk Score", value: `${proposal.risk_score}/100`, icon: <FaChartLine />, tone: proposal.risk_score > 50 ? "high" : "low" },
    { label: "Confidence", value: `${proposal.confidence}%`, icon: <FaShieldAlt />, tone: "motor" },
    { label: "Vehicle Value", value: `₹${Number(v.vehicle_value || 0).toLocaleString("en-IN")}`, icon: <FaCarSide />, tone: "gold" },
    { label: "Driver Age", value: raw.driver_age, icon: <FaUserTie />, tone: "motor" },
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
              Vehicle Insurance · Reference #{proposal.id} · Submitted {proposal.created_at}
            </p>
          </div>
          <StatusStamp status={proposal.status} />
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

      <div className="mpd-panel">
        <section className="mpd-section">
          <div className="mpd-section-head">
            <FaCarSide className="mpd-section-icon" />
            <h3>Vehicle Details</h3>
          </div>
          <div className="mpd-grid">
            <div className="mpd-field"><span className="mpd-field-label">Make / Model</span><span className="mpd-field-value">{v.make} {v.model}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Year</span><span className="mpd-field-value">{v.year}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Type</span><span className="mpd-field-value">{v.vehicle_type}</span></div>
            <div className="mpd-field"><span className="mpd-field-label"><FaGasPump /> Fuel</span><span className="mpd-field-value">{v.fuel_type}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Engine (cc)</span><span className="mpd-field-value">{v.engine_cc}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Color</span><span className="mpd-field-value">{v.color}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Safety Features</span><span className="mpd-field-value">{v.safety_features ? "Yes" : "No"}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Anti-Theft</span><span className="mpd-field-value">{v.anti_theft ? "Yes" : "No"}</span></div>
          </div>
        </section>

        <section className="mpd-section">
          <div className="mpd-section-head">
            <FaUserTie className="mpd-section-icon" />
            <h3>Driver & Usage</h3>
          </div>
          <div className="mpd-grid">
            <div className="mpd-field"><span className="mpd-field-label">Driver Age</span><span className="mpd-field-value">{raw.driver_age}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Driving Experience</span><span className="mpd-field-value">{raw.driving_experience} yrs</span></div>
            <div className="mpd-field"><span className="mpd-field-label">License Age</span><span className="mpd-field-value">{raw.license_age} yrs</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Previous Accidents</span><span className="mpd-field-value">{raw.previous_accidents}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Previous Claims</span><span className="mpd-field-value">{raw.previous_claims}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Traffic Violations</span><span className="mpd-field-value">{raw.traffic_violations}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Usage Type</span><span className="mpd-field-value">{raw.usage_type}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Annual Mileage</span><span className="mpd-field-value">{raw.annual_mileage} km</span></div>
            <div className="mpd-field"><span className="mpd-field-label">City / Region</span><span className="mpd-field-value">{raw.city}, {raw.region}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Previously Insured</span><span className="mpd-field-value">{raw.previous_insurance}</span></div>
            <div className="mpd-field"><span className="mpd-field-label">Policy Lapses</span><span className="mpd-field-value">{raw.policy_lapses}</span></div>
          </div>
        </section>

        {proposal.document_filename && (
          <section className="mpd-section">
            <div className="mpd-section-head">
              <FaFileAlt className="mpd-section-icon" />
              <h3>Submitted Document</h3>
            </div>
            <div className="mpd-grid">
              <div className="mpd-field">
                <span className="mpd-field-label">File</span>
                <span className="mpd-field-value">
                  <a href={getVehicleProposalDocumentUrl(proposal.id)} target="_blank" rel="noreferrer">
                    {proposal.document_filename}
                  </a>
                </span>
              </div>
              {proposal.extracted_fields?.name && (
                <div className="mpd-field"><span className="mpd-field-label">Extracted Name</span><span className="mpd-field-value">{proposal.extracted_fields.name}</span></div>
              )}
              {proposal.extracted_fields?.dob && (
                <div className="mpd-field"><span className="mpd-field-label">Extracted DOB</span><span className="mpd-field-value">{proposal.extracted_fields.dob}</span></div>
              )}
            </div>
            {(proposal.validation_results || []).some((r) => !r.valid) && (
              <p className="mpd-none-text" style={{ color: "#D64545", marginTop: "8px" }}>
                ⚠ Document validation flagged mismatches — check details before approving.
              </p>
            )}
          </section>
        )}

        <section className="mpd-section mpd-section-last">
          <div className="mpd-section-head">
            <FaChartLine className="mpd-section-icon" />
            <h3>AI Risk Explanation</h3>
          </div>
          <p className="mpd-reasoning">{proposal.reasoning_summary}</p>

          <div className="mpd-factor-grid">
            <div>
              <h4>Risk Factors</h4>
              {(proposal.risk_factors || []).length === 0 && <p className="mpd-none-text">None flagged</p>}
              {(proposal.risk_factors || []).map((f, i) => (
                <p key={i} className="mpd-factor mpd-factor-risk">{f.detail}</p>
              ))}
            </div>
            <div>
              <h4>Positive Factors</h4>
              {(proposal.positive_factors || []).map((f, i) => (
                <p key={i} className="mpd-factor mpd-factor-positive">{f.detail}</p>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mpd-actions">
        <button
          className="mpd-action-btn mpd-action-secondary"
          onClick={() => navigate(`/motor-document-verification/${id}`)}
        >
          <FaFileAlt />
          Document Verification
        </button>

        <button
          className="mpd-action-btn mpd-action-secondary"
          onClick={() => navigate(`/motor-risk-analysis/${id}`)}
        >
          <FaChartLine />
          AI Risk Analysis
        </button>
      </div>

      {proposal.status === "PENDING" && (
        <div className="mpd-actions">
          <button
            className="mpd-action-btn mpd-action-secondary"
            disabled={deciding}
            onClick={() => handleDecision("REJECTED")}
          >
            <FaTimesCircle />
            Reject
          </button>

          <button
            className="mpd-action-btn mpd-action-primary"
            disabled={deciding}
            onClick={() => handleDecision("APPROVED")}
          >
            <FaCheckCircle />
            Approve
          </button>
        </div>
      )}
    </div>
  );
}

export default MotorProposalDetails;