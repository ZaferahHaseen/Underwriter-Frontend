import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCarSide, FaExclamationTriangle } from "react-icons/fa";
import "./MotorRiskAnalysis.css";
import { getDummyMotorProposal } from "../../../api/dummyMotorProposals";
import { getDummyFleetRiskResult } from "../../../api/dummyMotorRisk";
import { getMotorProposal, getMotorFleetRiskResult, decideMotorVehicle } from "../../../api/motorAdapter";
import BackButton from "../../../components/BackButton";
import TopBar from "../../../components/TopBar";
import RiskGauge from "../../../components/RiskGauge";
import RiskChart from "../RiskChart";

// WIRED TO BACKEND: reuses the risk_score/risk_factors already computed
// server-side when each vehicle proposal was submitted (no re-scoring).
// Approve/Reject now call the real PATCH /proposals/{id}/decision endpoint.
const USE_DUMMY_DATA = false;

function MotorRiskAnalysis() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [fleetResult, setFleetResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  // Local decision state per vehicle (dummy — swap for a real decide-vehicle
  // API call once the backend teammate exposes one).
  const [decisions, setDecisions] = useState({});

  useEffect(() => {
    setLoading(true);
    if (USE_DUMMY_DATA) {
      const p = getDummyMotorProposal(id);
      const fr = getDummyFleetRiskResult(p.vehicles);
      setProposal(p);
      setFleetResult(fr);
      setActiveVehicleId(fr.per_vehicle[0]?.vehicle.vehicle_id ?? null);
      setLoading(false);
      return;
    }

    getMotorProposal(id)
      .then(async (p) => {
        const fr = await getMotorFleetRiskResult(p.vehicles);
        setProposal(p);
        setFleetResult(fr);
        setActiveVehicleId(fr.per_vehicle[0]?.vehicle.vehicle_id ?? null);
        // Pre-fill decisions from real status (already-decided vehicles
        // show their real APPROVED/REJECTED instead of resetting to blank).
        const initialDecisions = {};
        p.vehicles.forEach((v) => {
          if (v.status === "APPROVED" || v.status === "REJECTED") {
            initialDecisions[v.vehicle_id] = v.status;
          }
        });
        setDecisions(initialDecisions);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mra-page">
        <BackButton to={`/motor-proposal/${id}`} />
        <p className="state-text">Running risk analysis…</p>
      </div>
    );
  }

  if (!proposal || !fleetResult) return null;

  const active = fleetResult.per_vehicle.find((r) => r.vehicle.vehicle_id === activeVehicleId) || fleetResult.per_vehicle[0];
  const activeDecision = decisions[active.vehicle.vehicle_id];

  const handleDecide = async (decision) => {
    // Optimistic UI update, then persist via the real decision endpoint.
    setDecisions((prev) => ({ ...prev, [active.vehicle.vehicle_id]: decision }));
    if (!USE_DUMMY_DATA) {
      try {
        await decideMotorVehicle(active.vehicle.vehicle_id, decision);
      } catch (err) {
        alert(err.message || "Could not save decision.");
      }
    }
  };

  return (
    <div className="mra-page">
      <div className="mra-hero">
        <div className="mra-page-header">
          <BackButton to={`/motor-proposal/${id}`} />
          <div className="mra-page-header-text">
            <h1 className="page-title">AI Risk Analysis</h1>
            <p className="page-subhead">
              {proposal.full_name} · {fleetResult.vehicle_count} vehicle{fleetResult.vehicle_count > 1 ? "s" : ""} · Reference #{proposal.id}
            </p>
          </div>
          <TopBar homeTo="/underwriter/home" />
        </div>
      </div>

      <div className="mra-scroll-area">
        {/* ---- Fleet summary ---- */}
        <div className="mra-fleet-summary">
          <div className="mra-fleet-gauge">
            <RiskGauge score={fleetResult.fleet_risk_score} label="Fleet Risk Score" size={160} />
          </div>
          <div className="mra-fleet-stats">
            <div className="mra-fleet-stat">
              <span className="mono mra-fleet-stat-value">{fleetResult.vehicle_count}</span>
              <span className="mra-fleet-stat-label">Vehicles Assessed</span>
            </div>
            <div className="mra-fleet-stat">
              <span className="mono mra-fleet-stat-value">{fleetResult.vehicles_needing_review}</span>
              <span className="mra-fleet-stat-label">Needing Review</span>
            </div>
            <div className="mra-fleet-stat mra-fleet-stat-wide">
              <span className="mra-fleet-stat-label">Highest Risk Vehicle</span>
              <span className="mra-fleet-stat-highlight">
                <FaExclamationTriangle />
                {fleetResult.highest_risk_vehicle.vehicle_make} {fleetResult.highest_risk_vehicle.vehicle_model}
                <span className="mono"> · {fleetResult.highest_risk_vehicle.registration_number}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---- Vehicle selector tabs ---- */}
        <div className="mra-vehicle-tabs">
          {fleetResult.per_vehicle.map(({ vehicle, result }) => (
            <button
              key={vehicle.vehicle_id}
              className={vehicle.vehicle_id === active.vehicle.vehicle_id ? "mra-vehicle-tab active" : "mra-vehicle-tab"}
              onClick={() => setActiveVehicleId(vehicle.vehicle_id)}
            >
              <FaCarSide />
              <span>{vehicle.vehicle_make} {vehicle.vehicle_model}</span>
              <span className={`mra-tab-score mra-tab-score-${result.risk_score >= 60 ? "high" : result.risk_score >= 35 ? "moderate" : "low"}`}>
                {result.risk_score}
              </span>
              {decisions[vehicle.vehicle_id] && (
                <span className={`mra-tab-decision mra-tab-decision-${decisions[vehicle.vehicle_id].toLowerCase()}`}>
                  {decisions[vehicle.vehicle_id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ---- Active vehicle detail ---- */}
        <div className="mra-result-shell">
          <aside className="mra-result-aside">
            <RiskGauge score={active.result.risk_score} label="Vehicle Risk Score" size={170} />
            <div className="mra-vehicle-info">
              <p className="mono">{active.vehicle.registration_number}</p>
              <p>{active.vehicle.vehicle_year} · {active.vehicle.fuel_type} · {active.vehicle.vehicle_usage}</p>
            </div>

            {!activeDecision && (
              <div className="mra-decision-buttons">
                <button className="mra-decision-approve" onClick={() => handleDecide("APPROVED")}>
                  Approve
                </button>
                <button className="mra-decision-reject" onClick={() => handleDecide("REJECTED")}>
                  Reject
                </button>
              </div>
            )}

            {activeDecision && (
              <p className={`mra-final-decision ${activeDecision === "APPROVED" ? "mra-final-approved" : "mra-final-rejected"}`}>
                Decision: {activeDecision}
              </p>
            )}
          </aside>

          <div className="mra-result-main">
            <div className="mra-summary-box">
              <h3>AI Summary</h3>
              <p>{active.result.reasoning_summary}</p>
            </div>

            <div className="mra-list-section">
              <div className="mra-list-box mra-list-box-risk">
                <h3>Risk Factors</h3>
                {active.result.risk_factors.length === 0 && <p className="mra-list-empty">No risk factors flagged.</p>}
                <ul>
                  {active.result.risk_factors.map((factor, index) => (
                    <li key={index} className="mra-risk-item">{factor.detail}</li>
                  ))}
                </ul>
              </div>

              <div className="mra-list-box mra-list-box-positive">
                <h3>Positive Factors</h3>
                {active.result.positive_factors.length === 0 && <p className="mra-list-empty">No positive factors identified.</p>}
                <ul>
                  {active.result.positive_factors.map((factor, index) => (
                    <li key={index} className="mra-positive-item">{factor.detail}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mra-chart-card">
              <RiskChart riskFactors={active.result.risk_factors} positiveFactors={active.result.positive_factors} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotorRiskAnalysis;