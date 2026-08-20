import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { FaCarSide, FaExclamationTriangle, FaEye, FaEyeSlash, FaTimes, FaExclamationCircle, FaCheckCircle } from "react-icons/fa";

import "./MotorRiskAnalysis.css";

import { getMotorProposal, getMotorFleetRiskResult, decideMotorVehicle } from "../../../api/motorAdapter";

import BackButton from "../../../components/BackButton";

import TopBar from "../../../components/TopBar";

import RiskGauge from "../../../components/RiskGauge";

import RiskChart from "../RiskChart";
 
const isEmptyVal = (v) => v === null || v === undefined || v === "" || v === "-" || v === "—";
 
// Shared risk-tier convention for this page (mirrors the thresholds already

// used for the fleet strip): >=60 high, >=35 moderate, otherwise low.

const riskTier = (score) => {

  if (score === null || score === undefined || Number.isNaN(score)) return null;

  if (score >= 60) return { label: "High Risk", tone: "high" };

  if (score >= 35) return { label: "Moderate Risk", tone: "moderate" };

  return { label: "Low Risk", tone: "low" };

};
 
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

  const fleetTier = riskTier(fleetResult.fleet_risk_score);

  const activeTier = riskTier(active.result.risk_score);
 
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
 
      {/* ---------------- Sticky navbar ---------------- */}
<header className="mra-navbar">
<div className="mra-navbar-left">
<BackButton to={`/motor-proposal/${id}`} />
<span className="mra-navbar-divider" aria-hidden="true" />
<div className="mra-navbar-text">
<h1 className="mra-navbar-title">AI Risk Analysis</h1>
<p className="mra-navbar-subtitle">

              {proposal.full_name} · {fleetResult.vehicle_count} vehicle{fleetResult.vehicle_count > 1 ? "s" : ""} · Reference #{proposal.id}
</p>
</div>
</div>
<div className="mra-navbar-right">

          {fleetResult.vehicles_needing_review > 0 && (
<span className="mra-review-pill">
<FaExclamationTriangle />

              {fleetResult.vehicles_needing_review} needing review
</span>

          )}
<TopBar homeTo="/underwriter/home" />
</div>
</header>
 
      {/* ---------------- Fleet overview band ---------------- */}
<section className="mra-fleet-overview">
<div className="mra-container mra-fleet-row">
<div className="mra-fleet-gauge-block">
<RiskGauge score={fleetResult.fleet_risk_score} label="Fleet Risk Score" size={136} />

            {fleetTier && (
<span className={`mra-tier-badge mra-tier-${fleetTier.tone}`}>{fleetTier.label}</span>

            )}
</div>
 
          <div className="mra-fleet-divider" />
 
          <div className="mra-fleet-stats">
<div className="mra-fleet-stat">
<span className="mono mra-fleet-stat-value">{fleetResult.vehicle_count}</span>
<span className="mra-fleet-stat-label">Vehicles Assessed</span>
</div>
 
            <div className="mra-fleet-stat-divider" />
 
            <div className="mra-fleet-stat">
<span className="mono mra-fleet-stat-value">{fleetResult.vehicles_needing_review}</span>
<span className="mra-fleet-stat-label">Needing Review</span>
</div>
 
            <div className="mra-fleet-stat-divider" />
 
            <div className="mra-fleet-stat mra-fleet-stat-wide">
<span className="mra-fleet-stat-label">Highest Risk Vehicle</span>
<span className="mra-fleet-stat-highlight">
<FaExclamationTriangle />

                {fleetResult.highest_risk_vehicle.vehicle_make} {fleetResult.highest_risk_vehicle.vehicle_model}

                {!isEmptyVal(fleetResult.highest_risk_vehicle.registration_number) && (
<span className="mono mra-fleet-stat-highlight-reg"> · {fleetResult.highest_risk_vehicle.registration_number}</span>

                )}
</span>
</div>
</div>
</div>
</section>
 
      {/* ---------------- Vehicle selector strip ---------------- */}
<section className="mra-vehicle-strip">
<div className="mra-container">
<span className="mra-strip-label">Fleet</span>
 
          <div className="mra-strip-track">

            {pageItems.map(({ vehicle, result }) => {

              const status = decisions[vehicle.vehicle_id];

              const isActive = vehicle.vehicle_id === active.vehicle.vehicle_id;

              const scoreTier = result.risk_score >= 60 ? "high" : result.risk_score >= 35 ? "moderate" : "low";
 
              return (
<button

                  type="button"

                  key={vehicle.vehicle_id}

                  className={`mra-strip-item mra-strip-item-${scoreTier}${isActive ? " active" : ""}`}

                  onClick={() => setActiveVehicleId(vehicle.vehicle_id)}
>
<FaCarSide className="mra-strip-icon" />
 
                  <span className="mra-strip-text">
<span className="mra-strip-name">{vehicle.vehicle_make} {vehicle.vehicle_model}</span>

                    {status && (
<span className={`mra-strip-decision mra-strip-decision-${status.toLowerCase()}`}>

                        {status === "APPROVED" ? <FaCheckCircle /> : <FaTimes />} {status}
</span>

                    )}
</span>
 
                  <span className="mra-strip-score">{result.risk_score}</span>
</button>

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
</section>
 
      {/* ---------------- Vehicle detail ---------------- */}
<section className="mra-detail">
<div className="mra-container mra-detail-row">
 
          <aside className="mra-detail-aside">
<RiskGauge score={active.result.risk_score} label="Vehicle Risk Score" size={150} />

            {activeTier && (
<span className={`mra-tier-badge mra-tier-${activeTier.tone}`}>{activeTier.label}</span>

            )}
 
            <div className="mra-vehicle-info">

              {!isEmptyVal(active.vehicle.registration_number) && (
<p className="mono">{active.vehicle.registration_number}</p>

              )}
<p>{active.vehicle.vehicle_year} · {active.vehicle.fuel_type} · {active.vehicle.vehicle_usage}</p>
</div>
 
            {!activeDecision && (
<div className="mra-decision-buttons">
<button className="mra-decision-reject" onClick={() => handleDecide(active.vehicle.vehicle_id, "REJECTED")}>

                  Reject
</button>
<button className="mra-decision-approve" onClick={() => handleDecide(active.vehicle.vehicle_id, "APPROVED")}>

                  Approve
</button>
</div>

            )}
 
            {activeDecision && (
<p className={`mra-final-decision ${activeDecision === "APPROVED" ? "mra-final-approved" : "mra-final-rejected"}`}>

                Decision: {activeDecision}
</p>

            )}
</aside>
 
          <div className="mra-detail-divider" />
 
          <div className="mra-result-main">
 
            <div className="mra-main-section">
<h3 className="mra-section-title mra-section-title-accent">AI Summary</h3>
<p className="mra-summary-text">{active.result.reasoning_summary}</p>
</div>
 
            <div className="mra-main-section mra-factors-section">
<div className="mra-factor-col">
<h3 className="mra-section-title mra-section-title-risk">Risk Factors</h3>

                {active.result.risk_factors.length === 0 ? (
<p className="mra-list-empty">No risk factors flagged.</p>

                ) : (
<ul className="mra-factor-list">

                    {active.result.risk_factors.map((factor, index) => (
<li key={index} className="mra-factor-item mra-risk-item">
<span className="mra-factor-marker" aria-hidden="true" />
<span>{factor.detail}</span>
</li>

                    ))}
</ul>

                )}
</div>
 
              <div className="mra-factor-divider" aria-hidden="true" />
 
              <div className="mra-factor-col">
<h3 className="mra-section-title mra-section-title-positive">Positive Factors</h3>

                {active.result.positive_factors.length === 0 ? (
<p className="mra-list-empty">No positive factors identified.</p>

                ) : (
<ul className="mra-factor-list">

                    {active.result.positive_factors.map((factor, index) => (
<li key={index} className="mra-factor-item mra-positive-item">
<span className="mra-factor-marker" aria-hidden="true" />
<span>{factor.detail}</span>
</li>

                    ))}
</ul>

                )}
</div>
</div>
 
            <div className="mra-main-section">
<div className="mra-chart-header">
<h3 className="mra-section-title">Factor Breakdown</h3>
<button className="mra-chart-toggle" onClick={() => setShowChart((v) => !v)}>

                  {showChart ? <FaEyeSlash /> : <FaEye />}

                  {showChart ? "Hide Chart" : "Show Chart"}
</button>
</div>

              {showChart && (
<div className="mra-chart-wrap">
<RiskChart riskFactors={active.result.risk_factors} positiveFactors={active.result.positive_factors} />
</div>

              )}
</div>
 
          </div>
</div>
</section>
</div>

  );

}
 
export default MotorRiskAnalysis;
 