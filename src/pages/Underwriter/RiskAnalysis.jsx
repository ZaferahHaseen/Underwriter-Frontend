import { useState } from "react";
import { getUnderwritingDecision } from "../../api/underwritingApi";
import "./RiskAnalysis.css";

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

function RiskAnalysis() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
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

  return (
    <div className="risk-page">
      <h1 className="page-title">AI Underwriter Risk Analysis</h1>

      <form className="risk-form" onSubmit={handleSubmit}>
        <div className="form-grid">

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              value={form.age}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Annual Income</label>
            <input
              type="number"
              name="annual_income"
              value={form.annual_income}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Sum Assured</label>
            <input
              type="number"
              name="sum_assured"
              value={form.sum_assured}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>BMI</label>
            <input
              type="number"
              step="any"
              name="bmi"
              value={form.bmi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Smoker (0/1)</label>
            <input
              type="number"
              name="smoker"
              value={form.smoker}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Alcohol Consumption (0/1)</label>
            <input
              type="number"
              name="alcohol_consumption"
              value={form.alcohol_consumption}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Pre Existing Disease (0/1)</label>
            <input
              type="number"
              name="pre_existing_disease"
              value={form.pre_existing_disease}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Family Medical History (0/1)</label>
            <input
              type="number"
              name="family_medical_history"
              value={form.family_medical_history}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Occupation Risk</label>
            <input
              type="number"
              name="occupation_risk"
              value={form.occupation_risk}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Credit Score</label>
            <input
              type="number"
              name="credit_score"
              value={form.credit_score}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Previous Claims</label>
            <input
              type="number"
              name="num_previous_claims"
              value={form.num_previous_claims}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Years With Insurer</label>
            <input
              type="number"
              name="years_with_insurer"
              value={form.years_with_insurer}
              onChange={handleChange}
            />
          </div>

        </div>

        <button className="analyze-btn" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Risk"}
        </button>
      </form>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="result-card">

          <h2 className="result-title">{result.suggestion}</h2>

          <div className="score-section">

            <div className="score-box">
              <h4>Confidence</h4>
              <p>{result.confidence}%</p>
            </div>

            <div className="score-box">
              <h4>Risk Score</h4>
              <p>{result.risk_score}</p>
            </div>

          </div>

          <div className="summary-box">
            <h3>AI Summary</h3>
            <p>{result.reasoning_summary}</p>
          </div>

          <div className="list-section">

            <div className="list-box">
              <h3>Risk Factors</h3>

              <ul>
                {result.risk_factors.map((factor, index) => (
                  <li key={index}>{factor.detail}</li>
                ))}
              </ul>
            </div>

            <div className="list-box">
              <h3>Positive Factors</h3>

              <ul>
                {result.positive_factors.map((factor, index) => (
                  <li key={index}>{factor.detail}</li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

export default RiskAnalysis;