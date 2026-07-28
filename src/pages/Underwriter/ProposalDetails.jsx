import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./ProposalDetails.css";
import { getProposal, decideProposal } from "../../api/underwritingApi";
import RiskChart from "./RiskChart";
import BackButton from "../../components/BackButton";
import RiskGauge from "../../components/RiskGauge";
import StatusStamp from "../../components/StatusStamp";

function getRiskLevel(score) {
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    getProposal(id)
      .then(setProposal)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDecision = async (status) => {
    setActing(true);
    try {
      await decideProposal(id, status);
      setProposal((prev) => ({ ...prev, status }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActing(false);
    }
  };

  if (loading)
    return (
      <div className="proposal-container">
        <BackButton to="/underwriter/dashboard" />
        <p className="state-text">Loading proposal…</p>
      </div>
    );

  if (error)
    return (
      <div className="proposal-container">
        <BackButton to="/underwriter/dashboard" />
        <p className="state-text error-text">Error: {error}</p>
      </div>
    );

  if (!proposal) return null;

  const riskLevel = getRiskLevel(proposal.risk_score);

  return (
    <div className="proposal-container">
      <div className="proposal-topbar">
        <BackButton to="/underwriter/dashboard" />
        <h1>Proposal Details</h1>
      </div>

      <div className="proposal-card">
        {/* ---- Client Information ---- */}
        <section className="section">
          <div className="section-header">
            <h2>Client Information</h2>
            <StatusStamp status={proposal.status} />
          </div>
          <div className="info-grid">
            <span className="label">Name</span>
            <span className="value">{proposal.full_name}</span>

            <span className="label">Policy Type</span>
            <span className="value">{proposal.insurance_type}</span>

            <span className="label">Submitted</span>
            <span className="value mono">{proposal.created_at}</span>

            <span className="label">Reference ID</span>
            <span className="value mono">#{proposal.id}</span>
          </div>
        </section>

        {/* ---- AI Risk Analysis ---- */}
        <section className="section">
          <div className="section-header">
            <h2>AI Risk Analysis</h2>
          </div>

          <div className="gauge-row">
            <RiskGauge score={proposal.risk_score} label="Overall Risk Score" size={220} />
            <p className="summary-text">{proposal.reasoning_summary}</p>
          </div>

          <button className="graph-toggle-btn" onClick={() => setShowChart((s) => !s)}>
            {showChart ? "Hide Factor Breakdown" : "View Factor Breakdown"}
          </button>

          {showChart && (
            <RiskChart
              riskFactors={proposal.risk_factors}
              positiveFactors={riskLevel === "High" ? [] : proposal.positive_factors}
            />
          )}
        </section>

        {/* ---- Risk Factors ---- */}
        <section className="section">
          <h3>Risk Factors</h3>
          <ul className="factor-list">
            {proposal.risk_factors.map((f, i) => (
              <li key={i} className="factor-item risk">
                <span className="factor-icon" />
                <span>{f.detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- Positive Factors ---- */}
        {riskLevel !== "High" && (
          <section className="section">
            <h3>Positive Factors</h3>
            <ul className="factor-list">
              {proposal.positive_factors.map((f, i) => (
                <li key={i} className="factor-item positive">
                  <span className="factor-icon" />
                  <span>{f.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---- Decision ---- */}
        {proposal.status === "PENDING" ? (
          <div className="decision-buttons">
            <button className="approve-btn" disabled={acting} onClick={() => handleDecision("APPROVED")}>
              <FaCheck /> Approve
            </button>
            <button className="reject-btn" disabled={acting} onClick={() => handleDecision("REJECTED")}>
              <FaTimes /> Reject
            </button>
          </div>
        ) : (
          <p className="final-decision">
            <b>Final Decision:</b> {proposal.status}
          </p>
        )}
      </div>
    </div>
  );
}

export default ProposalDetails;
