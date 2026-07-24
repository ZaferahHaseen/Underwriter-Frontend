import { useState, useEffect } from "react";
import "./ClientDashboard.css";
import { getUnderwritingFromProposal } from "../../api/underwritingApi";

function ClientDashboard() {
  const [formData, setFormData] = useState({
    insuranceType: "",
    fullName: "",
    age: "",
    annualIncome: "",
    sumAssured: "",
    height: "",
    weight: "",
    bmi: "",
    smoker: "0",
    alcohol: "0",
    preExistingDisease: "0",
    familyHistory: "0",
    occupation: "0",
    creditScore: "",
    previousClaims: "",
    yearsWithInsurer: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (formData.height && formData.weight) {
      const h = Number(formData.height) / 100;
      const bmi = (Number(formData.weight) / (h * h)).toFixed(1);
      setFormData((prev) => ({ ...prev, bmi }));
    }
  }, [formData.height, formData.weight]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const payload = {
      age: Number(formData.age),
      annual_income: Number(formData.annualIncome),
      sum_assured: Number(formData.sumAssured),
      height_cm: Number(formData.height),
      weight_kg: Number(formData.weight),
      smoker: formData.smoker === "1" ? "yes" : "no",
      alcohol_consumption: { "0": "none", "1": "occasional", "2": "regular" }[formData.alcohol],
      pre_existing_disease: formData.preExistingDisease === "1" ? "yes" : "no",
      family_medical_history: formData.familyHistory === "1" ? "yes" : "no",
      occupation: { "0": "office", "1": "field", "2": "hazardous" }[formData.occupation],
      credit_score: Number(formData.creditScore),
      num_previous_claims: Number(formData.previousClaims),
      years_with_insurer: Number(formData.yearsWithInsurer),
    };

    try {
      setLoading(true);
      const data = await getUnderwritingFromProposal(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-page">
      <div className="welcome-card">
        <h1>Insurance Proposal Form</h1>
        <p>Fill in your insurance proposal details.</p>
      </div>

      <div className="proposal-card">
        <h2>Client Insurance Proposal</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Insurance Type</label>
              <select name="insuranceType" value={formData.insuranceType} onChange={handleChange}>
                <option value="">Select Insurance</option>
                <option>Health Insurance</option>
                <option>Life Insurance</option>
                <option>Vehicle Insurance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter Full Name" />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Enter Age" />
            </div>

            <div className="form-group">
              <label>Annual Income</label>
              <input type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange} placeholder="Annual Income" />
            </div>

            <div className="form-group">
              <label>Coverage Amount</label>
              <input type="number" name="sumAssured" value={formData.sumAssured} onChange={handleChange} placeholder="Coverage Amount" />
            </div>

            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height" />
            </div>

            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" />
            </div>

            <div className="form-group">
              <label>BMI (Auto Calculated)</label>
              <input type="text" value={formData.bmi} readOnly />
            </div>
          </div>

          <div className="question-box">
            <h3>Do you smoke?</h3>
            <div className="radio-group">
              <label>
                <input type="radio" name="smoker" value="1" checked={formData.smoker === "1"} onChange={handleChange} />
                Yes
              </label>
              <label>
                <input type="radio" name="smoker" value="0" checked={formData.smoker === "0"} onChange={handleChange} />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Alcohol Consumption</label>
            <select name="alcohol" value={formData.alcohol} onChange={handleChange}>
              <option value="0">None</option>
              <option value="1">Occasionally</option>
              <option value="2">Regularly</option>
            </select>
          </div>

          <div className="question-box">
            <h3>Do you have any pre-existing disease?</h3>
            <div className="radio-group">
              <label>
                <input type="radio" name="preExistingDisease" value="1" checked={formData.preExistingDisease === "1"} onChange={handleChange} />
                Yes
              </label>
              <label>
                <input type="radio" name="preExistingDisease" value="0" checked={formData.preExistingDisease === "0"} onChange={handleChange} />
                No
              </label>
            </div>
          </div>

          <div className="question-box">
            <h3>Any family history of major illness?</h3>
            <div className="radio-group">
              <label>
                <input type="radio" name="familyHistory" value="1" checked={formData.familyHistory === "1"} onChange={handleChange} />
                Yes
              </label>
              <label>
                <input type="radio" name="familyHistory" value="0" checked={formData.familyHistory === "0"} onChange={handleChange} />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Occupation</label>
            <select name="occupation" value={formData.occupation} onChange={handleChange}>
              <option value="0">Office Job</option>
              <option value="1">Field Job</option>
              <option value="2">Hazardous Job</option>
            </select>
          </div>

          <h2 className="section-title">Additional Information</h2>

          <div className="additional-grid">
            <div className="form-group">
              <label>Credit Score</label>
              <input type="number" name="creditScore" value={formData.creditScore} onChange={handleChange} placeholder="e.g. 750" />
            </div>

            <div className="form-group">
              <label>Previous Claims</label>
              <input type="number" name="previousClaims" value={formData.previousClaims} onChange={handleChange} placeholder="e.g. 1" />
            </div>

            <div className="form-group">
              <label>Years With Insurer</label>
              <input type="number" name="yearsWithInsurer" value={formData.yearsWithInsurer} onChange={handleChange} placeholder="e.g. 5" />
            </div>
          </div>

          <p className="company-note">
            Demo Mode: Normally these values are retrieved automatically from
            the insurer's database. For this project, enter sample values to
            allow the AI Underwriter to perform risk analysis.
          </p>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Analyzing..." : "Submit Proposal for AI Underwriting"}
          </button>
        </form>

        {error && (
          <div className="result-box error-box">
            <p><b>Error:</b> {error}</p>
          </div>
        )}

        {result && (
          <div className="result-box">
            <h2>{result.suggestion}</h2>
            <p><b>Confidence:</b> {result.confidence}%</p>
            <p><b>Risk Score:</b> {result.risk_score}</p>
            <p>{result.reasoning_summary}</p>

            <h3>Risk Factors</h3>
            <ul>
              {result.risk_factors.map((f, i) => <li key={i}>{f.detail}</li>)}
            </ul>

            <h3>Positive Factors</h3>
            <ul>
              {result.positive_factors.map((f, i) => <li key={i}>{f.detail}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;