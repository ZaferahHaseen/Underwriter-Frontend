import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaChartLine,
  FaUser,
  FaHeartbeat,
  FaWallet,
  FaBirthdayCake,
  FaWeight,
} from "react-icons/fa";
import "./ProposalDashboard.css";
import { getProposal } from "../../api/underwritingApi";
import { getDummyProposal } from "../../api/dummyProposals";
import BackButton from "../../components/BackButton";
import StatusStamp from "../../components/StatusStamp";

// ---------------------------------------------------------------------------
// Flip this to false once the backend teammate's /proposals/:id endpoint is
// live — every other line here already calls the real getProposal() API,
// this flag just decides whether we trust it or fall back to local dummy data.
// ---------------------------------------------------------------------------
const USE_DUMMY_DATA = false;

function ProposalDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (USE_DUMMY_DATA) {
      setProposal(getDummyProposal(id));
      setLoading(false);
      return;
    }

    getProposal(id)
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pd-page">
        <BackButton to="/underwriter/dashboard" />
        <p className="state-text">Loading client details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd-page">
        <BackButton to="/underwriter/dashboard" />
        <p className="state-text error-text">Error: {error}</p>
      </div>
    );
  }

  if (!proposal) return null;

  const highlights = [
    { label: "Age", value: proposal.age, icon: <FaBirthdayCake />, tone: "signal" },
    { label: "Annual Income", value: `₹${Number(proposal.annual_income).toLocaleString("en-IN")}`, icon: <FaWallet />, tone: "gold" },
    { label: "Sum Assured", value: `₹${Number(proposal.sum_assured).toLocaleString("en-IN")}`, icon: <FaChartLine />, tone: "low" },
    { label: "BMI", value: proposal.bmi, icon: <FaWeight />, tone: "high" },
  ];

  const healthDetails = [
    { label: "Height", value: `${proposal.height} cm` },
    { label: "Weight", value: `${proposal.weight} kg` },
    { label: "Smoker", value: proposal.smoker },
    { label: "Alcohol Consumption", value: proposal.alcohol_consumption },
    { label: "Pre-Existing Disease", value: proposal.pre_existing_disease },
    { label: "Family Medical History", value: proposal.family_medical_history },
  ];

  const financialDetails = [
    { label: "Occupation", value: proposal.occupation },
    { label: "Credit Score", value: proposal.credit_score },
    { label: "Previous Claims", value: proposal.num_previous_claims },
    { label: "Years With Insurer", value: proposal.years_with_insurer },
  ];

  return (
    <div className="pd-page">
      <div className="pd-header">
        <BackButton to="/underwriter/dashboard" />
        <div className="pd-header-text">
          <h1>{proposal.full_name}</h1>
          <p className="pd-subhead">
            {proposal.insurance_type} Policy · Reference #{proposal.id} · Submitted {proposal.created_at}
          </p>
        </div>
        <StatusStamp status={proposal.status} />
      </div>

      <div className="pd-cards">
        {highlights.map((h) => (
          <div className="pd-stat-card" key={h.label}>
            <div className={`pd-stat-icon pd-stat-icon-${h.tone}`}>{h.icon}</div>
            <div>
              <h2 className="mono">{h.value}</h2>
              <p>{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pd-panel">
        <section className="pd-section">
          <div className="pd-section-head">
            <FaHeartbeat className="pd-section-icon" />
            <h3>Health Profile</h3>
          </div>
          <div className="pd-grid">
            {healthDetails.map((d) => (
              <div className="pd-field" key={d.label}>
                <span className="pd-field-label">{d.label}</span>
                <span className="pd-field-value">{d.value}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="pd-section pd-section-last">
          <div className="pd-section-head">
            <FaUser className="pd-section-icon" />
            <h3>Financial History</h3>
          </div>
          <div className="pd-grid">
            {financialDetails.map((d) => (
              <div className="pd-field" key={d.label}>
                <span className="pd-field-label">{d.label}</span>
                <span className="pd-field-value">{d.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pd-actions">
        <button
          className="pd-action-btn pd-action-secondary"
          onClick={() => navigate(`/document-verification/${id}`)}
        >
          <FaFileMedical />
          Document Verification
        </button>

        <button
          className="pd-action-btn pd-action-primary"
          onClick={() => navigate(`/risk-analysis/${id}`)}
        >
          <FaChartLine />
          AI Risk Analysis
        </button>
      </div>
    </div>
  );
}

export default ProposalDashboard;
