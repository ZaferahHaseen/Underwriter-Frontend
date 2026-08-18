import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getUnderwritingDecision, getProposal, decideProposal, quickMotorUnderwrite } from "../../api/underwritingApi";
import "./RiskAnalysis.css";
import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";
import RiskGauge from "../../components/RiskGauge";
import RiskChart from "./RiskChart";

const initialHealthForm = {
  age: 30,
  annual_income: 500000,
  sum_assured: 1000000,
  bmi: 24,
  smoker: 0,
  alcohol_consumption: 0,
  pre_existing_disease: 0,
  family_medical_history: 0,
  occupation_risk: 0,
  credit_score: 700,
  num_previous_claims: 0,
  years_with_insurer: 0,
};

const healthFields = [
  { name: "age", label: "Age" },
  { name: "annual_income", label: "Annual Income" },
  { name: "sum_assured", label: "Sum Assured" },
  { name: "bmi", label: "BMI", step: "any" },
  { name: "smoker", label: "Smoker (0/1)" },
  { name: "alcohol_consumption", label: "Alcohol Consumption (0/1)" },
  { name: "pre_existing_disease", label: "Pre-Existing Disease (0/1)" },
  { name: "family_medical_history", label: "Family Medical History (0/1)" },
  { name: "occupation_risk", label: "Occupation Risk" },
  { name: "credit_score", label: "Credit Score" },
  { name: "num_previous_claims", label: "Previous Claims" },
  { name: "years_with_insurer", label: "Years With Insurer" },
];

// ---- Motor: matches backend QuickMotorCheckRequest exactly (16 raw fields) ----
const initialMotorForm = {
  vehicle_age_years: 5,
  engine_cc: 1200,
  idv: 600000,
  safety_features: "yes",
  anti_theft: "no",
  fuel_type: "petrol",
  driver_age: 30,
  driving_experience_years: 8,
  license_age: 8,
  previous_accidents: 0,
  num_previous_claims: 0,
  traffic_violations: 0,
  usage_type: "private",
  annual_mileage: 12000,
  previous_insurance: "yes",
  policy_lapses: 0,
};

const motorFields = [
  { name: "vehicle_age_years", label: "Vehicle Age (years)", type: "number" },
  { name: "engine_cc", label: "Engine (CC)", type: "number" },
  { name: "idv", label: "Insured Declared Value", type: "number" },
  { name: "safety_features", label: "Safety Features (ABS/Airbags)", type: "select", options: ["yes", "no"] },
  { name: "anti_theft", label: "Anti-Theft Device", type: "select", options: ["yes", "no"] },
  { name: "fuel_type", label: "Fuel Type", type: "select", options: ["petrol", "diesel", "cng", "hybrid", "electric"] },
  { name: "driver_age", label: "Driver Age", type: "number" },
  { name: "driving_experience_years", label: "Driving Experience (years)", type: "number" },
  { name: "license_age", label: "License Age (years)", type: "number" },
  { name: "previous_accidents", label: "Previous Accidents", type: "number" },
  { name: "num_previous_claims", label: "Previous Claims", type: "number" },
  { name: "traffic_violations", label: "Traffic Violations", type: "number" },
  { name: "usage_type", label: "Usage Type", type: "select", options: ["private", "business", "delivery", "commercial", "taxi"] },
  { name: "annual_mileage", label: "Annual Mileage", type: "number" },
  { name: "previous_insurance", label: "Previous Insurance", type: "select", options: ["yes", "no"] },
  { name: "policy_lapses", label: "Policy Lapses", type: "number" },
];

function ResultView({ result, status, deciding, onDecide }) {
  const [showChart, setShowChart] = useState(true);

  return (
    <div className="result-shell">
      {/* ---- Left: score summary (sticky) ---- */}
      <aside className="result-aside">
        <div className="result-gauge-block">
          <RiskGauge score={result.risk_score} label="Risk Score" size={220} />
        </div>

        {status === "PENDING" && (
          <div className="decision-buttons">
            <button className="decision-approve" disabled={deciding} onClick={() => onDecide("APPROVED")}>
              Approve
            </button>
            <button className="decision-reject" disabled={deciding} onClick={() => onDecide("REJECTED")}>
              Reject
            </button>
          </div>
        )}

        {status && status !== "PENDING" && (
          <p className={`final-decision-banner ${status === "APPROVED" ? "final-approved" : "final-rejected"}`}>
            Final Decision: {status}
          </p>
        )}
      </aside>

      {/* ---- Right: reasoning + factors ---- */}
      <div className="result-main">
        <div className="summary-box">
          <h3>AI Summary</h3>
          <p>{result.reasoning_summary}</p>
        </div>

        <div className="list-section">
          <div className="list-box list-box-risk">
            <h3>Risk Factors</h3>
            {result.risk_factors.length === 0 && <p className="list-empty">No risk factors flagged.</p>}
            <ul>
              {result.risk_factors.map((factor, index) => (
                <li key={index} className="risk-item">{factor.detail}</li>
              ))}
            </ul>
          </div>

          <div className="list-box list-box-positive">
            <h3>Positive Factors</h3>
            {result.positive_factors.length === 0 && <p className="list-empty">No positive factors identified.</p>}
            <ul>
              {result.positive_factors.map((factor, index) => (
                <li key={index} className="positive-item">{factor.detail}</li>
              ))}
            </ul>
          </div>
        </div>

        <button className="graph-toggle-btn" onClick={() => setShowChart((s) => !s)}>
          {showChart ? "Hide Factor Breakdown" : "View Factor Breakdown"}
        </button>
        {showChart && (
          <div className="chart-card">
            <RiskChart riskFactors={result.risk_factors} positiveFactors={result.positive_factors} />
          </div>
        )}
      </div>
    </div>
  );
}

function RiskAnalysis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isQuickCheck = id === "new";

  const checkType = searchParams.get("type") === "motor" ? "motor" : "health";
  const backTarget = checkType === "motor" ? "/underwriter/motor/dashboard" : "/underwriter/dashboard";
  const [healthForm, setHealthForm] = useState(initialHealthForm);
  const [motorForm, setMotorForm] = useState(initialMotorForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [proposal, setProposal] = useState(null);
  const [proposalLoading, setProposalLoading] = useState(!isQuickCheck);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    if (isQuickCheck) return;

    setProposalLoading(true);
    getProposal(id)
      .then(setProposal)
      .catch((err) => console.error(err))
      .finally(() => setProposalLoading(false));
  }, [id, isQuickCheck]);

  const form = checkType === "motor" ? motorForm : healthForm;
  const setForm = checkType === "motor" ? setMotorForm : setHealthForm;
  const activeFields = checkType === "motor" ? motorFields : healthFields;

  const handleChange = (e) => {
    const { name, value, type: inputType } = e.target;
    // health fields stay numeric; motor "select" fields (yes/no, fuel_type,
    // usage_type) stay as raw strings — matches backend QuickMotorCheckRequest.
    const field = activeFields.find((f) => f.name === name);
    const isStringField = field?.type === "select";
    setForm((prev) => ({
      ...prev,
      [name]: isStringField ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (checkType === "motor") {
        const data = await quickMotorUnderwrite(motorForm);
        setResult(data);
      } else {
        const data = await getUnderwritingDecision(form);
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Proposal mode: results only, no form ----------------
  if (!isQuickCheck) {
    const handleDecision = async (status) => {
      setDeciding(true);
      try {
        await decideProposal(id, status);
        setProposal((prev) => ({ ...prev, status }));
      } catch (err) {
        console.error(err);
      } finally {
        setDeciding(false);
      }
    };

    return (
      <div className="risk-page">
        <div className="risk-hero">
          <div className="risk-page-header">
            <BackButton to={`/proposal/${id}`} />
            <div className="risk-page-header-text">
              <h1 className="page-title">AI Risk Analysis</h1>
              <p className="page-subhead">
                {proposal ? `${proposal.full_name} · Reference #${proposal.id}` : "Loading…"}
              </p>
            </div>
            <TopBar homeTo="/underwriter/home" />
          </div>
        </div>

        {proposalLoading && <p className="state-text">Loading risk analysis…</p>}
        {!proposalLoading && proposal && (
          <ResultView
            result={proposal}
            status={proposal.status}
            deciding={deciding}
            onDecide={handleDecision}
          />
        )}
      </div>
    );
  }

  // ---------------- Quick Check mode: manual entry form ----------------
  return (
    <div className={checkType === "motor" ? "risk-page risk-page-motor" : "risk-page"}>
      <div className="risk-hero">
        <div className="risk-page-header">
          <BackButton to={backTarget} />
          <div className="risk-page-header-text">
            <h1 className="page-title">
              {checkType === "motor" ? "Motor Quick Risk Check" : "Health / Life Quick Risk Check"}
            </h1>
            <p className="page-subhead">
              {checkType === "motor"
                ? "Run a raw vehicle & driver profile through the AI model without creating a proposal."
                : "Run a raw applicant profile through the AI model without creating a proposal."}
            </p>
          </div>
          <TopBar homeTo="/underwriter/home" />
        </div>
      </div>

      <form className="risk-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {activeFields.map((f) => (
            <div className="form-group" key={f.name}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select name={f.name} value={form[f.name]} onChange={handleChange}>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  step={f.step}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                />
              )}
            </div>
          ))}
        </div>

        <button className="analyze-btn" type="submit" disabled={loading}>
          {loading ? "Analyzing…" : "Analyze Risk"}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {result && <ResultView result={result} />}
    </div>
  );
}

export default RiskAnalysis;