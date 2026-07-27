import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProposalDetails.css";
import { getProposal, decideProposal } from "../../api/underwritingApi";

function getRiskLevel(score) {
  if (score >= 60) return "High";
  if (score >= 35) return "Moderate";
  return "Low";
}

function ProposalDetails(){

  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acting, setActing] = useState(false);

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

  if (loading) return <div className="proposal-container"><p>Loading...</p></div>;
  if (error) return <div className="proposal-container"><p style={{ color: "red" }}>Error: {error}</p></div>;
  if (!proposal) return null;

  const riskLevel = getRiskLevel(proposal.risk_score);

  return(

    <div className="proposal-container">

      <h1>Proposal Details</h1>

      <div className="proposal-card">

        {/* ---- Client Information ---- */}
        <section className="section">
          <h2>Client Information</h2>
          <div className="info-grid">
            <span className="label">Name</span>
            <span className="value">{proposal.full_name}</span>

            <span className="label">Policy Type</span>
            <span className="value">{proposal.insurance_type}</span>

            <span className="label">Submitted</span>
            <span className="value">{proposal.created_at}</span>

            <span className="label">Status</span>
            <span className="value">{proposal.status}</span>
          </div>
        </section>

        {/* ---- AI Risk Analysis ---- */}
        <section className="section">
          <div className="section-header">
            <h2>AI Risk Analysis</h2>
            <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
              {riskLevel} Risk
            </span>
          </div>

          <div className="info-grid">
            <span className="label">Risk Score</span>
            <span className="value">{(proposal.risk_score / 10).toFixed(1)}/10</span>
          </div>

          <p className="summary-text">{proposal.reasoning_summary}</p>
        </section>

        {/* ---- Risk Factors ---- */}
        <section className="section">
          <h3>Risk Factors</h3>
          <ul className="factor-list">
            {proposal.risk_factors.map((f, i) => (
              <li key={i} className="factor-item risk">
                <span className="factor-icon"></span>
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
                <span className="factor-icon"></span>
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
              Approve
            </button>
            <button className="reject-btn" disabled={acting} onClick={() => handleDecision("REJECTED")}>
              Reject
            </button>
          </div>
        ) : (
          <p className="final-decision"><b>Final Decision:</b> {proposal.status}</p>
        )}

        <button className="back-btn" onClick={() => navigate("/underwriter/dashboard")}>
          Back to Dashboard
        </button>

      </div>

    </div>

  )

}

export default ProposalDetails;