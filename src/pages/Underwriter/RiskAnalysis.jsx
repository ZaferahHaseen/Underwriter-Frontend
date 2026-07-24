import { useState } from "react";
import { getUnderwritingDecision } from "../../api/underwritingApi";

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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Risk Analysis</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(initialForm).map((field) => (
          <div key={field} style={{ marginBottom: "8px" }}>
            <label>{field}: </label>
            <input
              type="number"
              name={field}
              value={form[field]}
              onChange={handleChange}
              step="any"
            />
          </div>
        ))}
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Get Suggestion"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "20px", border: "1px solid #ccc", padding: "12px" }}>
          <h3>{result.suggestion}</h3>
          <p>Confidence: {result.confidence}%</p>
          <p>Risk Score: {result.risk_score}</p>
          <p>{result.reasoning_summary}</p>

          <h4>Risk Factors</h4>
          <ul>
            {result.risk_factors.map((f, i) => (
              <li key={i}>{f.detail}</li>
            ))}
          </ul>

          <h4>Positive Factors</h4>
          <ul>
            {result.positive_factors.map((f, i) => (
              <li key={i}>{f.detail}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RiskAnalysis;