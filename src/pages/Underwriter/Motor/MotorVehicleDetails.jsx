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
import { getDummyMotorProposal } from "../../../api/dummyMotorProposals";
import { getMotorProposal } from "../../../api/motorAdapter";
import PageHeader from "../../../components/PageHeader";

// WIRED TO BACKEND via api/motorAdapter.js (same call MotorProposalDetails.jsx
// uses — GET /api/v1/vehicle/proposals/:id or GET /api/v1/vehicle/fleet/:id).
const USE_DUMMY_DATA = false;

function MotorVehicleDetails() {
  const { id, vehicleId } = useParams();

  const [vehicle, setVehicle] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    if (USE_DUMMY_DATA) {
      const p = getDummyMotorProposal(id);
      const v = p.vehicles.find((veh) => veh.vehicle_id === vehicleId);
      setProposal(p);
      setVehicle(v || null);
      setLoading(false);
      return;
    }

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

  const highlights = [
    { label: "Insured Declared Value", value: `₹${vehicle.idv.toLocaleString("en-IN")}`, icon: <FaShieldAlt />, tone: "motor" },
    { label: "Driver Age", value: vehicle.driver_age, icon: <FaUserAlt />, tone: "gold" },
    { label: "Previous Claims", value: vehicle.num_previous_claims, icon: <FaRoad />, tone: "low" },
    { label: "Previous Accidents", value: vehicle.previous_accidents, icon: <FaRoad />, tone: "high" },
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
          <h3>Vehicle & Risk Details</h3>
        </div>
        <div className="mvd-grid">
          <div className="mvd-field">
            <span className="mvd-field-label"><FaGasPump /> Fuel Type</span>
            <span className="mvd-field-value">{vehicle.fuel_type}</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Usage</span>
            <span className="mvd-field-value">{vehicle.vehicle_usage}</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Vehicle Age</span>
            <span className="mvd-field-value">{vehicle.vehicle_age_years} yrs</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Driving Experience</span>
            <span className="mvd-field-value">{vehicle.driving_experience_years} yrs</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">No-Claim Bonus</span>
            <span className="mvd-field-value">{vehicle.no_claim_bonus_percent}%</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Prior Accident/Claim Flag</span>
            <span className="mvd-field-value">{vehicle.prior_accident_claim ? "Yes" : "No"}</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Annual Mileage</span>
            <span className="mvd-field-value">{vehicle.annual_mileage_km.toLocaleString("en-IN")} km</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Years With Insurer</span>
            <span className="mvd-field-value">{vehicle.years_with_insurer}</span>
          </div>
          <div className="mvd-field">
            <span className="mvd-field-label">Credit Score</span>
            <span className="mvd-field-value">{vehicle.credit_score}</span>
          </div>
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