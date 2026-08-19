import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaCarSide, FaExclamationTriangle, FaEye, FaEyeSlash, FaCheck, FaTimes, FaExclamationCircle } from "react-icons/fa";
import "./MotorRiskAnalysis.css";
import { getMotorProposal, getMotorFleetRiskResult, decideMotorVehicle } from "../../../api/motorAdapter";
import BackButton from "../../../components/BackButton";
import TopBar from "../../../components/TopBar";
import RiskGauge from "../../../components/RiskGauge";
import RiskChart from "../RiskChart";

const isEmptyVal = (v) => v === null || v === undefined || v === "" || v === "-" || v === "—";

// WIRED TO BACKEND: reuses risk_score/risk_factors already computed
// server-side when each vehicle proposal was submitted (no re-scoring).
// Approve/Reject call the real PATCH /proposals/{id}/decision endpoint.
function MotorRiskAnalysis() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [fleetResult, setFleetResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVehicleId, setActiveVehicleId] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [showChart, setShowChart] = useState(false);
  const [tabPage, setTabPage] = useState(0);
  const TABS_PER_PAGE = 8;

  // Mini popup (toast) replacing native alert() — auto-dismisses after 4s.
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setLoading(true);
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

  // Now takes an explicit vehicleId so it can be called from the tab
  // buttons (any vehicle) as well as the sidebar (active vehicle only).
  const handleDecide = async (vehicleId, decision) => {
    setDecisions((prev) => ({ ...prev, [vehicleId]: decision }));
    try {
      await decideMotorVehicle(vehicleId, decision);
    } catch (err) {
      setToast(err.message || "Could not save decision.");
    }
  };

  const totalPages = Math.ceil(fleetResult.per_vehicle.length / TABS_PER_PAGE);
  const pageItems = fleetResult.per_vehicle.slice(
    tabPage * TABS_PER_PAGE,
    tabPage * TABS_PER_PAGE + TABS_PER_PAGE
  );

  return (
    <div className="mra-page">
      {toast && (
        <div className="mra-toast" role="alert">
          <FaExclamationCircle className="mra-toast-icon" />
          <span>{toast}</span>
          <button
            type="button"
            className="mra-toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      )}

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
                {!isEmptyVal(fleetResult.highest_risk_vehicle.registration_number) && (
                  <span className="mono"> · {fleetResult.highest_risk_vehicle.registration_number}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* ---- Vehicle selector tabs (paginated) ---- */}
        <div className="mra-vehicle-tabs-box">
          <div className="mra-vehicle-tabs-grid">
            {pageItems.map(({ vehicle, result }) => {
              const status = decisions[vehicle.vehicle_id]; // undefined = pending
              const isActive = vehicle.vehicle_id === active.vehicle.vehicle_id;
              return (
                <div
                  key={vehicle.vehicle_id}
                  className={isActive ? "mra-vehicle-tab active" : "mra-vehicle-tab"}
                >
                  <button
                    type="button"
                    className="mra-tab-top"
                    onClick={() => setActiveVehicleId(vehicle.vehicle_id)}
                  >
                    <FaCarSide />
                    <span className="mra-tab-name">{vehicle.vehicle_make} {vehicle.vehicle_model}</span>
                    <span className={`mra-tab-score mra-tab-score-${result.risk_score >= 60 ? "high" : result.risk_score >= 35 ? "moderate" : "low"}`}>
                      {result.risk_score}
                    </span>
                  </button>

                  <div className="mra-tab-actions">
                    {status ? (
                      <span className={`mra-tab-decision mra-tab-decision-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    ) : (
                      <>
                        <span className="mra-tab-decision mra-tab-decision-pending">PENDING</span>
                        <button
                          type="button"
                          className="mra-tab-approve"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecide(vehicle.vehicle_id, "APPROVED");
                          }}
                        >
                          <FaCheck /> Approve
                        </button>
                        <button
                          type="button"
                          className="mra-tab-reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecide(vehicle.vehicle_id, "REJECTED");
                          }}
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mra-tabs-pagination">
              <button
                className="mra-page-arrow"
                disabled={tabPage === 0}
                onClick={() => setTabPage((p) => Math.max(0, p - 1))}
              >
                ‹
              </button>
              <div className="mra-page-dots">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={i === tabPage ? "mra-page-dot active" : "mra-page-dot"}
                    onClick={() => setTabPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="mra-page-arrow"
                disabled={tabPage === totalPages - 1}
                onClick={() => setTabPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                ›
              </button>
            </div>
          )}
        </div>

        {/* ---- Active vehicle detail ---- */}
        <div className="mra-result-shell">
          <aside className="mra-result-aside">
            <RiskGauge score={active.result.risk_score} label="Vehicle Risk Score" size={170} />
            <div className="mra-vehicle-info">
              {!isEmptyVal(active.vehicle.registration_number) && (
                <p className="mono">{active.vehicle.registration_number}</p>
              )}
              <p>{active.vehicle.vehicle_year} · {active.vehicle.fuel_type} · {active.vehicle.vehicle_usage}</p>
            </div>

            {!activeDecision && (
              <div className="mra-decision-buttons">
                <button className="mra-decision-approve" onClick={() => handleDecide(active.vehicle.vehicle_id, "APPROVED")}>
                  Approve
                </button>
                <button className="mra-decision-reject" onClick={() => handleDecide(active.vehicle.vehicle_id, "REJECTED")}>
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
              <div className="mra-chart-header">
                <h3>Factor Breakdown</h3>
                <button className="mra-chart-toggle" onClick={() => setShowChart((v) => !v)}>
                  {showChart ? <FaEyeSlash /> : <FaEye />}
                  {showChart ? "Hide Chart" : "Show Chart"}
                </button>
              </div>
              {showChart && (
                <RiskChart riskFactors={active.result.risk_factors} positiveFactors={active.result.positive_factors} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotorRiskAnalysis;