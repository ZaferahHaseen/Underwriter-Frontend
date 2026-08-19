import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCarSide,
  FaGasPump,
  FaShieldAlt,
  FaUserAlt,
  FaRoad,
} from "react-icons/fa";
import "./MotorVehicleDetails.css";
import { getMotorProposal } from "../../../api/motorAdapter";
import PageHeader from "../../../components/PageHeader";

// WIRED TO BACKEND via api/motorAdapter.js (same call MotorProposalDetails.jsx
// uses — GET /api/v1/vehicle/proposals/:id or GET /api/v1/vehicle/fleet/:id).

const isEmpty = (v) => v === null || v === undefined || v === "" || v === "—";

// Shared field renderer: keeps label/value weight consistent and marks
// missing data with a distinct muted style instead of a plain "—".
function Field({ label, value, icon }) {
  const empty = isEmpty(value);
  return (
    <div className="mvd-field">
      <span className="mvd-field-label">
        {icon} {label}
      </span>
      <span className={`mvd-field-value${empty ? " mvd-field-value-empty" : ""}`}>
        {empty ? "Not provided" : value}
      </span>
    </div>
  );
}

function MotorVehicleDetails() {
  const { id, vehicleId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    getMotorProposal(id)
      .then((p) => {
        // vehicle_id from the real adapter is a number; the route param is
        // always a string — compare as strings so the lookup actually matches.
        const v = p.vehicles.find((veh) => String(veh.vehicle_id) === String(vehicleId));
        setProposal(p);
        setVehicle(v || null);
      })
      .finally(() => setLoading(false));
  }, [id, vehicleId]);

  if (loading) {
    return (
      <div className="mvd-page">
        <PageHeader theme="motor" title="Vehicle Details" backTo={`/motor-proposal/${id}`} homeTo="/underwriter/home" compact />
        <p className="state-text">Loading vehicle details…</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mvd-page">
        <PageHeader theme="motor" title="Vehicle Details" backTo={`/motor-proposal/${id}`} homeTo="/underwriter/home" compact />
        <p className="state-text error-text">Vehicle not found on this proposal.</p>
      </div>
    );
  }

  // Icon tone driven by what the value actually means, not a fixed per-card
  // color. Claims/accidents at 0 are a GOOD outcome — should read neutral,
  // not alarm-colored; only a nonzero count flags red.
  const riskTone = (n) => (Number(n) > 0 ? "high" : "neutral");

  const highlights = [
    { label: "Insured Declared Value", value: `₹${vehicle.idv.toLocaleString("en-IN")}`, icon: <FaShieldAlt />, tone: "motor" },
    { label: "Driver Age", value: vehicle.driver_age, icon: <FaUserAlt />, tone: "gold" },
    { label: "Previous Claims", value: vehicle.num_previous_claims, icon: <FaRoad />, tone: riskTone(vehicle.num_previous_claims) },
    { label: "Previous Accidents", value: vehicle.previous_accidents, icon: <FaRoad />, tone: riskTone(vehicle.previous_accidents) },
  ];

  return (
    <div className="mvd-page">
      <PageHeader
        theme="motor"
        title={
          <h1>
            {vehicle.vehicle_make} {vehicle.vehicle_model}{" "}
            <span className="mvd-year">({vehicle.vehicle_year})</span>
          </h1>
        }
        subtitle={
          <>
            {proposal?.full_name} · Reference #{proposal?.id} ·{" "}
            <span className="mono">{vehicle.registration_number}</span>
          </>
        }
        backTo={`/motor-proposal/${id}`}
        homeTo="/underwriter/home"
        badge={
          <span className={`mdash-status-pill mdash-status-${vehicle.status.toLowerCase()}`}>
            {vehicle.status}
          </span>
        }
      />

      <div className="mvd-cards">
        {highlights.map((h) => (
          <div className="mvd-stat-card" key={h.label}>
            <div className={`mvd-stat-icon mvd-stat-icon-${h.tone}`}>{h.icon}</div>
            <div>
              <h2 className="mono">{h.value}</h2>
              <p>{h.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mvd-panel">
        <div className="mvd-section-head">
          <FaCarSide className="mvd-section-icon" />
          <h3>Vehicle Details</h3>
        </div>
        <div className="mvd-grid">
          <Field label="Vehicle Type" value={vehicle.vehicle_type} />
          <Field label="Engine Capacity" value={vehicle.engine_cc ? `${vehicle.engine_cc} cc` : null} />
          <Field label="Fuel Type" value={vehicle.fuel_type} icon={<FaGasPump />} />
          <Field label="Color" value={vehicle.color} />
          <Field label="Safety Features" value={vehicle.safety_features} />
          <Field label="Anti-Theft Device" value={vehicle.anti_theft} />
          <Field label="Vehicle Age" value={vehicle.vehicle_age_years != null ? `${vehicle.vehicle_age_years} yrs` : null} />
        </div>
      </div>

      <div className="mvd-panel">
        <div className="mvd-section-head">
          <FaUserAlt className="mvd-section-icon" />
          <h3>Driver Details</h3>
        </div>
        <div className="mvd-grid">
          <Field label="Driving Experience" value={vehicle.driving_experience_years != null ? `${vehicle.driving_experience_years} yrs` : null} />
          <Field label="License Held Since" value={vehicle.license_age != null ? `${vehicle.license_age} yrs` : null} />
          <Field label="Previous Accidents" value={vehicle.previous_accidents} />
          <Field label="Previous Claims" value={vehicle.num_previous_claims} />
          <Field label="Traffic Violations" value={vehicle.traffic_violations} />
          <Field label="No-Claim Bonus" value={vehicle.no_claim_bonus_percent != null ? `${vehicle.no_claim_bonus_percent}%` : null} />
          <Field label="Prior Accident/Claim Flag" value={vehicle.prior_accident_claim ? "Yes" : "No"} />
          <Field label="Credit Score" value={vehicle.credit_score} />
        </div>
      </div>

      <div className="mvd-panel">
        <div className="mvd-section-head">
          <FaRoad className="mvd-section-icon" />
          <h3>Usage &amp; Location</h3>
        </div>
        <div className="mvd-grid">
          <Field label="Usage" value={vehicle.vehicle_usage} />
          <Field label="Annual Mileage" value={vehicle.annual_mileage_km != null ? `${vehicle.annual_mileage_km.toLocaleString("en-IN")} km` : null} />
          <Field label="City" value={vehicle.city} />
          <Field label="State / Region" value={vehicle.region} />
        </div>
      </div>

      <div className="mvd-panel">
        <div className="mvd-section-head">
          <FaShieldAlt className="mvd-section-icon" />
          <h3>Insurance History</h3>
        </div>
        <div className="mvd-grid">
          <Field label="Previously Insured Elsewhere" value={vehicle.previous_insurance} />
          <Field label="Policy Lapses (Count)" value={vehicle.policy_lapses} />
          <Field label="Years With Insurer" value={vehicle.years_with_insurer} />
        </div>
      </div>

      {vehicle.documents?.length > 0 && (
        <div className="mvd-panel">
          <div className="mvd-section-head">
            <FaShieldAlt className="mvd-section-icon" />
            <h3>Document Status</h3>
          </div>
          <div className="mvd-doc-list">
            {vehicle.documents.map((doc) => (
              <div className="mvd-doc-row" key={doc.name}>
                <span>{doc.name}</span>
                <span className={`mvd-doc-pill mvd-doc-${doc.status.toLowerCase()}`}>{doc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MotorVehicleDetails;