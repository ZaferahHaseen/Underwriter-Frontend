import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUnderwritingDecision, getProposal, decideProposal } from "../../api/underwritingApi";  
import { getDummyProposal } from "../../api/dummyProposals";
import "./RiskAnalysis.css";
import BackButton from "../../components/BackButton";
import RiskGauge from "../../components/RiskGauge";
import RiskChart from "./RiskChart";

// Flip to false once the backend teammate's proposal-lookup endpoint is live.
const USE_DUMMY_DATA = false;

const initialForm = {
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

const fields = [
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

function ResultView({ result, status, deciding, onDecide }) {
  const [showChart, setShowChart] = useState(false);

  return (
    <div className="result-card">
      <h2 className="result-title">Risk Analysis</h2>

      <div className="score-section">
        <RiskGauge score={result.risk_score} label="Risk Score" size={200} />
        <div className="confidence-box">
          <h4>Model Confidence</h4>
          <p className="mono">{result.confidence}%</p>
        </div>
      </div>

      <div className="summary-box">
        <h3>AI Summary</h3>
        <p>{result.reasoning_summary}</p>
      </div>

      <button className="graph-toggle-btn" onClick={() => setShowChart((s) => !s)}>
        {showChart ? "Hide Factor Breakdown" : "View Factor Breakdown"}
      </button>
      {showChart && (
        <RiskChart riskFactors={result.risk_factors} positiveFactors={result.positive_factors} />
      )}

      <div className="list-section">
        <div className="list-box">
          <h3>Risk Factors</h3>
          <ul>
            {result.risk_factors.map((factor, index) => (
              <li key={index} className="risk-item">{factor.detail}</li>
            ))}
          </ul>
        </div>

        <div className="list-box">
          <h3>Positive Factors</h3>
          <ul>
            {result.positive_factors.map((factor, index) => (
              <li key={index} className="positive-item">{factor.detail}</li>
            ))}
          </ul>
        </div>
      </div>

      {status === "PENDING" && (
        <div className="decision-buttons">
          <button disabled={deciding} onClick={() => onDecide("APPROVED")}>
            Approve
          </button>
          <button disabled={deciding} onClick={() => onDecide("REJECTED")}>
            Reject
          </button>
        </div>
      )}

      {status && status !== "PENDING" && (
        <p className={`final-decision-banner ${status === "APPROVED" ? "final-approved" : "final-rejected"}`}>
          Final Decision: {status}
        </p>
      )}
    </div>
  );
}

function RiskAnalysis() {
  const { id } = useParams();
  const isQuickCheck = id === "new";

  // ---- Quick Check mode (manual form) ----
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---- Proposal mode (real client, show results directly) ----
  const [proposal, setProposal] = useState(null);
  const [proposalLoading, setProposalLoading] = useState(!isQuickCheck);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    if (isQuickCheck) return;

    setProposalLoading(true);
    if (USE_DUMMY_DATA) {
      setProposal(getDummyProposal(id));
      setProposalLoading(false);
      return;
    }
    getProposal(id)
      .then(setProposal)
      .catch((err) => console.error(err))
      .finally(() => setProposalLoading(false));
  }, [id, isQuickCheck]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await getUnderwritingDecision(form);
      setResult(data);
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
        <div className="risk-page-header">
          <BackButton to={`/proposal/${id}`} />
          <div>
            <h1 className="page-title">AI Risk Analysis</h1>
            <p className="page-subhead">
              {proposal ? `${proposal.full_name} · Reference #${proposal.id}` : "Loading…"}
            </p>
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
    <div className="risk-page">
      <div className="risk-page-header">
        <BackButton to="/underwriter/dashboard" />
        <div>
          <h1 className="page-title">Quick Risk Check</h1>
          <p className="page-subhead">Run a raw applicant profile through the AI model without creating a proposal.</p>
        </div>
      </div>

      <form className="risk-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          {fields.map((f) => (
            <div className="form-group" key={f.name}>
              <label>{f.label}</label>
              <input
                type="number"
                step={f.step}
                name={f.name}
                value={form[f.name]}
                onChange={handleChange}
              />
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
