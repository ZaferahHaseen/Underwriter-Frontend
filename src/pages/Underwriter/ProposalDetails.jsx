import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProposalDetails.css";
import { getProposal, decideProposal } from "../../api/underwritingApi";

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

  return(

    <div className="proposal-container">

      <h1>Proposal Details</h1>

      <div className="proposal-card">

        <h2>Client Information</h2>

        <p><b>Name:</b> {proposal.full_name}</p>
        <p><b>Policy Type:</b> {proposal.insurance_type}</p>
        <p><b>Submitted:</b> {proposal.created_at}</p>
        <p><b>Status:</b> {proposal.status}</p>

        <h2>AI Risk Analysis</h2>

        <p><b>Confidence:</b> {proposal.confidence}%</p>
        <p><b>Risk Score:</b> {proposal.risk_score}</p>
        <p>{proposal.reasoning_summary}</p>

        <h3>Risk Factors</h3>
        <ul>
          {proposal.risk_factors.map((f, i) => <li key={i}>{f.detail}</li>)}
        </ul>

        <h3>Positive Factors</h3>
        <ul>
          {proposal.positive_factors.map((f, i) => <li key={i}>{f.detail}</li>)}
        </ul>

        {proposal.status === "PENDING" ? (
          <div className="decision-buttons">
            <button disabled={acting} onClick={() => handleDecision("APPROVED")}>
              Approve
            </button>
            <button disabled={acting} onClick={() => handleDecision("REJECTED")}>
              Reject
            </button>
          </div>
        ) : (
          <p><b>Final Decision:</b> {proposal.status}</p>
        )}

        <button onClick={() => navigate("/underwriter/dashboard")}>
          Back to Dashboard
        </button>

      </div>

    </div>

  )

}

export default ProposalDetails;