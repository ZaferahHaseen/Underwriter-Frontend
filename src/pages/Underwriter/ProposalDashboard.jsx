import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaFileMedical,
  FaChartLine,
  FaUser,
  FaHeartbeat,
  FaWallet,
  FaBirthdayCake,
  FaWeight,
  FaCar,
  FaShieldAlt,
} from "react-icons/fa";
import "./ProposalDashboard.css";
import { getProposal } from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";
import StatusStamp from "../../components/StatusStamp";
import TopBar from "../../components/TopBar";
import { formatName } from "../../utils/format";

// backend sends "2026-08-18 17:57:59" — render it human-readable instead of
// leaking the raw ISO-ish string.
function formatSubmittedDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const isEmptyVal = (v) => v === null || v === undefined || v === "" || v === "-" || v === "—";

function Field({ label, value }) {
  const empty = isEmptyVal(value);
  return (
    <div className="pd-field">
      <span className="pd-field-label">{label}</span>
      <span className={`pd-field-value${empty ? " pd-field-value-empty" : ""}`}>
        {empty ? "Not provided" : String(value)}
      </span>
    </div>
  );
}

function ProposalDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

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

  const isMotor = proposal.insurance_type === "Vehicle Insurance";

  // BMI 18.5–24.9 is the normal range — icon shouldn't read as alarm-red
  // just because the field exists; only flag it when the value is actually
  // outside that band.
  const bmiTone = (bmi) => {
    const n = Number(bmi);
    if (Number.isNaN(n)) return "signal";
    return n >= 18.5 && n <= 24.9 ? "low" : "high";
  };

  const highlights = isMotor
    ? [
        { label: "Age", value: proposal.age, icon: <FaBirthdayCake />, tone: "signal" },
        { label: "Annual Income", value: `₹${Number(proposal.annual_income).toLocaleString("en-IN")}`, icon: <FaWallet />, tone: "gold" },
        { label: "Insured Declared Value", value: `₹${Number(proposal.sum_assured).toLocaleString("en-IN")}`, icon: <FaShieldAlt />, tone: "low" },
        { label: "No-Claim Bonus", value: proposal.no_claim_bonus_percent != null ? `${proposal.no_claim_bonus_percent}%` : "—", icon: <FaCar />, tone: "high" },
      ]
    : [
        { label: "Age", value: proposal.age, icon: <FaBirthdayCake />, tone: "signal" },
        { label: "Annual Income", value: `₹${Number(proposal.annual_income).toLocaleString("en-IN")}`, icon: <FaWallet />, tone: "gold" },
        { label: "Sum Assured", value: `₹${Number(proposal.sum_assured).toLocaleString("en-IN")}`, icon: <FaChartLine />, tone: "low" },
        { label: "BMI", value: proposal.bmi, icon: <FaWeight />, tone: bmiTone(proposal.bmi) },
      ];

  const healthDetails = [
    { label: "Height", value: `${proposal.height} cm` },
    { label: "Weight", value: `${proposal.weight} kg` },
    { label: "Smoker", value: proposal.smoker },
    { label: "Alcohol Consumption", value: proposal.alcohol_consumption },
    { label: "Pre-Existing Disease", value: proposal.pre_existing_disease },
    { label: "Family Medical History", value: proposal.family_medical_history },
  ];

  const vehicleDetails = [
    { label: "Vehicle Make", value: proposal.vehicle_make },
    { label: "Vehicle Model", value: proposal.vehicle_model },
    { label: "Manufacturing Year", value: proposal.vehicle_year },
    { label: "Registration Number", value: proposal.registration_number },
    { label: "Fuel Type", value: proposal.fuel_type },
    { label: "Vehicle Usage", value: proposal.vehicle_usage },
    { label: "Driving Experience", value: proposal.driving_experience_years != null ? `${proposal.driving_experience_years} yrs` : "—" },
    { label: "Prior Accident / Claim", value: proposal.prior_accident_claim },
  ];

  const financialDetails = [
    { label: "Occupation", value: proposal.occupation },
    { label: "Credit Score", value: proposal.credit_score },
    { label: "Previous Claims", value: proposal.num_previous_claims },
    { label: "Years With Insurer", value: proposal.years_with_insurer },
  ];

  const initials = (proposal.full_name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div className="pd-page">
      <div className="pd-hero">
        <div className="pd-header">
          <BackButton to="/underwriter/dashboard" />
          <div className="pd-avatar">{initials}</div>
          <div className="pd-header-text">
            <h1>{formatName(proposal.full_name)}</h1>
            <p className="pd-subhead">
              {proposal.insurance_type} Policy · Reference #{proposal.id} · Submitted {formatSubmittedDate(proposal.created_at)}
            </p>
          </div>
          <StatusStamp status={proposal.status} />
          <TopBar homeTo="/underwriter/home" />
        </div>
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
            {isMotor ? <FaCar className="pd-section-icon" /> : <FaHeartbeat className="pd-section-icon" />}
            <h3>{isMotor ? "Vehicle Profile" : "Health Profile"}</h3>
          </div>
          <div className="pd-grid">
            {(isMotor ? vehicleDetails : healthDetails).map((d) => (
              <Field key={d.label} label={d.label} value={d.value} />
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
              <Field key={d.label} label={d.label} value={d.value} />
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