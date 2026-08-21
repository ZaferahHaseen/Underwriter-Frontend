import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getUnderwritingDecision, getProposal, decideProposal } from "../../api/underwritingApi";  
import { getDummyProposal } from "../../api/dummyProposals";
import { getDummyMotorRiskResult } from "../../api/dummyMotorRisk";
import "./RiskAnalysis.css";
import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";
import RiskGauge from "../../components/RiskGauge";
import RiskChart from "./RiskChart";

// Flip to false once the backend teammate's proposal-lookup endpoint is live.
const USE_DUMMY_DATA = false;

// Motor risk-scoring has no backend endpoint yet, so Quick Check always runs
// the local dummy scorer for it. Flip this off (and wire a real API call in
// handleSubmit below) once that endpoint exists.
const USE_DUMMY_MOTOR_SCORING = true;

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

const initialMotorForm = {
  driver_age: 30,
  vehicle_age_years: 5,
  idv: 600000,
  driving_experience_years: 8,
  no_claim_bonus_percent: 20,
  prior_accident_claim: 0,
  commercial_use: 0,
  credit_score: 700,
  num_previous_claims: 0,
  years_with_insurer: 0,
};

const motorFields = [
  { name: "driver_age", label: "Driver Age" },
  { name: "vehicle_age_years", label: "Vehicle Age (years)" },
  { name: "idv", label: "Insured Declared Value" },
  { name: "driving_experience_years", label: "Driving Experience (years)" },
  { name: "no_claim_bonus_percent", label: "No-Claim Bonus (%)" },
  { name: "prior_accident_claim", label: "Prior Accident/Claim (0/1)" },
  { name: "commercial_use", label: "Commercial Use (0/1)" },
  { name: "credit_score", label: "Credit Score" },
  { name: "num_previous_claims", label: "Previous Claims" },
  { name: "years_with_insurer", label: "Years With Insurer" },
];

const STATUS_LABEL = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Simple, generic risk-tier read-out next to the score. Purely derived from
// the existing risk_score field (assumed 0-100, higher = riskier) — no new
// data required from the backend.
function getRiskTier(score) {
  if (score == null || Number.isNaN(score)) return null;
  if (score < 34) return { label: "Low Risk", tone: "low" };
  if (score < 67) return { label: "Moderate Risk", tone: "moderate" };
  return { label: "High Risk", tone: "high" };
}

// ---------------------------------------------------------------------
// Shared top navbar for both Quick Check and Proposal (result) modes.
// ---------------------------------------------------------------------
function RiskNavbar({ backTo, title, subtitle, status }) {
  return (
    <header className="risk-navbar">
      <div className="risk-navbar-left">
        <BackButton to={backTo} />
        <span className="risk-navbar-divider" aria-hidden="true" />
        <div className="risk-navbar-text">
          <h1 className="risk-navbar-title">{title}</h1>
          <p className="risk-navbar-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="risk-navbar-right">
        {status && (
          <span className={`status-pill status-pill-${status.toLowerCase()}`}>
            {STATUS_LABEL[status] || status}
          </span>
        )}
        <TopBar homeTo="/underwriter/home" />
      </div>
    </header>
  );
}

function ResultView({ result, status, deciding, onDecide }) {
  const [showChart, setShowChart] = useState(true);
  const tier = getRiskTier(result.risk_score);

  return (
    <div className="doc">
      <section className="doc-header">
        <div className="doc-header-text">
          <span className="doc-eyebrow">AI Summary</span>
          <p className="doc-summary-text">{result.reasoning_summary}</p>
        </div>
        <div className="doc-score-block">
          <RiskGauge score={result.risk_score} label="Risk Score" size={128} />
          {tier && (
            <span className={`risk-tier-badge risk-tier-${tier.tone}`}>{tier.label}</span>
          )}
        </div>
      </section>

      <section className="doc-section doc-factors">
        <div className="factor-column">
          <h3 className="doc-section-title doc-title-risk">Risk Factors</h3>
          {result.risk_factors.length === 0 ? (
            <p className="list-empty">No risk factors flagged.</p>
          ) : (
            <ul className="factor-list">
              {result.risk_factors.map((factor, index) => (
                <li key={index} className="factor-item factor-item-risk">
                  <span className="factor-marker" aria-hidden="true" />
                  <span>{factor.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="factor-column-divider" aria-hidden="true" />

        <div className="factor-column">
          <h3 className="doc-section-title doc-title-positive">Positive Factors</h3>
          {result.positive_factors.length === 0 ? (
            <p className="list-empty">No positive factors identified.</p>
          ) : (
            <ul className="factor-list">
              {result.positive_factors.map((factor, index) => (
                <li key={index} className="factor-item factor-item-positive">
                  <span className="factor-marker" aria-hidden="true" />
                  <span>{factor.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="doc-section">
        <div className="doc-section-header">
          <h3 className="doc-section-title">Factor Breakdown</h3>
          <button className="chart-toggle" onClick={() => setShowChart((s) => !s)}>
            {showChart ? "Hide" : "Show"}
          </button>
        </div>
        {showChart && (
          <div className="chart-wrap">
            <RiskChart riskFactors={result.risk_factors} positiveFactors={result.positive_factors} />
          </div>
        )}
      </section>

      {status === "PENDING" && (
        <div className="doc-action-bar">
          <span className="doc-action-label">Decision required</span>
          <div className="doc-action-buttons">
            <button className="btn-reject" disabled={deciding} onClick={() => onDecide("REJECTED")}>
              Reject
            </button>
            <button className="btn-approve" disabled={deciding} onClick={() => onDecide("APPROVED")}>
              Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function RiskAnalysis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isQuickCheck = id === "new";

  // ---- Quick Check mode (manual form) ----
  // Which question set to show is decided by where the user came from:
  // the Health/Life dashboard links here with ?type=health, the Motor
  // dashboard with ?type=motor. No in-page toggle — each dashboard only
  // ever sees its own questions.
  const checkType = searchParams.get("type") === "motor" ? "motor" : "health";
  const backTarget = checkType === "motor" ? "/underwriter/motor/dashboard" : "/underwriter/dashboard";
  const [healthForm, setHealthForm] = useState(initialHealthForm);
  const [motorForm, setMotorForm] = useState(initialMotorForm);
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

  const form = checkType === "motor" ? motorForm : healthForm;
  const setForm = checkType === "motor" ? setMotorForm : setHealthForm;
  const activeFields = checkType === "motor" ? motorFields : healthFields;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (checkType === "motor" && USE_DUMMY_MOTOR_SCORING) {
        // No backend endpoint for motor yet — score it locally so the
        // screen is fully demoable. See dummyMotorRisk.js for the logic,
        // and the flag above for how to switch to a real API call later.
        await new Promise((r) => setTimeout(r, 400)); // small delay to feel like a real call
        setResult(getDummyMotorRiskResult(motorForm));
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
        <RiskNavbar
          backTo={`/proposal/${id}`}
          title="AI Risk Analysis"
          subtitle={proposal ? `${proposal.full_name} · Reference #${proposal.id}` : "Loading…"}
          status={proposal?.status}
        />

        <div className="risk-body">
          {proposalLoading && <p className="state-text">Loading risk analysis…</p>}
          {!proposalLoading && proposal && (
            <div className="risk-document">
              <ResultView
                result={proposal}
                status={proposal.status}
                deciding={deciding}
                onDecide={handleDecision}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- Quick Check mode: manual entry form ----------------
  return (
    <div className="risk-page">
      <RiskNavbar
        backTo={backTarget}
        title={checkType === "motor" ? "Motor Quick Risk Check" : "Health / Life Quick Risk Check"}
        subtitle={
          checkType === "motor"
            ? "Run a raw vehicle & driver profile through the AI model without creating a proposal."
            : "Run a raw applicant profile through the AI model without creating a proposal."
        }
      />

      <div className="risk-body">
        <div className="risk-document">
          {checkType === "motor" && USE_DUMMY_MOTOR_SCORING && (
            <p className="dummy-data-note">
              No backend model is connected for motor yet — this runs a local placeholder scorer so the screen works end-to-end. Swap it out once the real endpoint is ready.
            </p>
          )}

          <form className="risk-form" onSubmit={handleSubmit}>
            <span className="doc-eyebrow">
              {checkType === "motor" ? "Vehicle & Driver Profile" : "Applicant Profile"}
            </span>
            <div className="form-grid">
              {activeFields.map((f) => (
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
      </div>
    </div>
  );
}

export default RiskAnalysis;
