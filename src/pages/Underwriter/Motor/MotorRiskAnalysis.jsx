import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCarSide } from "react-icons/fa";
import "./MotorRiskAnalysis.css";
import { getVehicleProposal } from "../../../api/underwritingApi";
import BackButton from "../../../components/BackButton";
import RiskGauge from "../../../components/RiskGauge";
import RiskChart from "../RiskChart";

// Real backend wired -- one proposal = one vehicle, no fleet tabs needed.
const USE_DUMMY_DATA = false;

function MotorRiskAnalysis() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setLoading(false);
      return;
    }
    getVehicleProposal(id)
      .then((data) => {
        setProposal(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mra-page">
        <BackButton to={`/motor-proposal/${id}`} />
        <p className="state-text">Running risk analysis…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mra-page">
        <BackButton to={`/motor-proposal/${id}`} />
        <p className="state-text error-text">Error: {error}</p>
      </div>
    );
  }

  if (!proposal) return null;

  const v = proposal.vehicle || {};

  return (
    <div className="mra-page">
      <div className="mra-hero">
        <div className="mra-page-header">
          <BackButton to={`/motor-proposal/${id}`} />
          <div>
            <h1 className="page-title">AI Risk Analysis</h1>
            <p className="page-subhead">
              {proposal.full_name} · {v.make} {v.model} · Reference #{proposal.id}
            </p>
          </div>
        </div>
      </div>

      <div className="mra-result-shell">
        <aside className="mra-result-aside">
          <RiskGauge score={proposal.risk_score} label="Vehicle Risk Score" size={200} />
          <div className="mra-confidence-box">
            <h4>Model Confidence</h4>
            <p className="mono">{proposal.confidence}%</p>
          </div>
          <div className="mra-vehicle-info">
            <p className="mono"><FaCarSide /> {v.make} {v.model}</p>
            <p>{v.year} · {v.fuel_type} · {v.vehicle_type}</p>
          </div>
        </aside>

        <div className="mra-result-main">
          <div className="mra-summary-box">
            <h3>AI Summary</h3>
            <p>{proposal.reasoning_summary}</p>
          </div>

          <div className="mra-list-section">
            <div className="mra-list-box mra-list-box-risk">
              <h3>Risk Factors</h3>
              {(proposal.risk_factors || []).length === 0 && <p className="mra-list-empty">No risk factors flagged.</p>}
              <ul>
                {(proposal.risk_factors || []).map((factor, index) => (
                  <li key={index} className="mra-risk-item">{factor.detail}</li>
                ))}
              </ul>
            </div>

            <div className="mra-list-box mra-list-box-positive">
              <h3>Positive Factors</h3>
              {(proposal.positive_factors || []).length === 0 && <p className="mra-list-empty">No positive factors identified.</p>}
              <ul>
                {(proposal.positive_factors || []).map((factor, index) => (
                  <li key={index} className="mra-positive-item">{factor.detail}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mra-chart-card">
            <RiskChart riskFactors={proposal.risk_factors || []} positiveFactors={proposal.positive_factors || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotorRiskAnalysis;