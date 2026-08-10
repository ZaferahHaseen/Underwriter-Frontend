import { useState, useEffect } from "react";
import { FaCheckCircle, FaShieldAlt, FaFileUpload, FaUserAlt, FaHeartbeat, FaWallet, FaCar } from "react-icons/fa";

import "./ClientDashboard.css";
import { submitProposal, getCountries, getDocTypesForCountry } from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";

const COUNTRY_NAMES = {
  AE: "United Arab Emirates",
  IN: "India",
  KE: "Kenya",
  NG: "Nigeria",
  ZA: "South Africa",
};

// Section ids are stable regardless of insurance type — only the label/icon/
// content of the 3rd step switches between health and vehicle content.
const SECTION_IDS = ["document", "applicant", "details", "financial"];

function ClientDashboard() {
  const [formData, setFormData] = useState({
    insuranceType: "",
    fullName: "",
    age: "",
    annualIncome: "",
    sumAssured: "",
    // health & lifestyle
    height: "",
    weight: "",
    bmi: "",
    smoker: "0",
    alcohol: "0",
    preExistingDisease: "0",
    familyHistory: "0",
    occupation: "0",
    // vehicle details
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    registrationNumber: "",
    fuelType: "petrol",
    vehicleUsage: "personal",
    drivingExperience: "",
    noClaimBonus: "",
    priorAccident: "0",
    // financial (shared)
    creditScore: "",
    previousClaims: "",
    yearsWithInsurer: "",
  });

  const isMotor = formData.insuranceType === "Vehicle Insurance";

  const STEPS = [
    { id: "document", label: "Identity Document", icon: <FaFileUpload /> },
    { id: "applicant", label: "Applicant Details", icon: <FaUserAlt /> },
    {
      id: "details",
      label: isMotor ? "Vehicle Details" : "Health & Lifestyle",
      icon: isMotor ? <FaCar /> : <FaHeartbeat />,
    },
    { id: "financial", label: "Financial Profile", icon: <FaWallet /> },
  ];

  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // document is just an attachment now - client never sees OCR/validation output
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState(null);

  // Two-step country/doc-type dropdown state
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [docListError, setDocListError] = useState(null);

  const [activeStep, setActiveStep] = useState("document");

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch((err) => setDocListError(err.message));
  }, []);

  useEffect(() => {
    if (!selectedCountry) {
      setDocTypes([]);
      setSelectedDocType("");
      return;
    }
    getDocTypesForCountry(selectedCountry)
      .then(setDocTypes)
      .catch((err) => setDocListError(err.message));
  }, [selectedCountry]);

  useEffect(() => {
    if (formData.height && formData.weight) {
      const h = Number(formData.height) / 100;
      const bmi = (Number(formData.weight) / (h * h)).toFixed(1);
      setFormData((prev) => ({ ...prev, bmi }));
    }
  }, [formData.height, formData.weight]);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveStep(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToStep = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDocError(null);
    setSubmitted(null);

    if (!formData.insuranceType) {
      setError("Select an insurance type before submitting.");
      scrollToStep("applicant");
      return;
    }

    if (!docFile) {
      setDocError("Attach your ID / certificate before submitting.");
      scrollToStep("document");
      return;
    }

    if (!selectedCountry || !selectedDocType) {
      setDocError("Select the document's country and type before submitting.");
      scrollToStep("document");
      return;
    }

    const country_code = selectedCountry;
    const doc_type = selectedDocType;

    // Fields every insurance type sends.
    const payload = {
      full_name: formData.fullName,
      insurance_type: formData.insuranceType,
      age: Number(formData.age),
      annual_income: Number(formData.annualIncome),
      sum_assured: Number(formData.sumAssured),
      occupation: { "0": "office", "1": "field", "2": "hazardous" }[formData.occupation],
      credit_score: Number(formData.creditScore),
      num_previous_claims: Number(formData.previousClaims),
      years_with_insurer: Number(formData.yearsWithInsurer),
      country_code,
      doc_type,
    };

    // Insurance-type-specific fields — see the comment above submitProposal()
    // in underwritingApi.js for the full contract the backend expects.
    if (isMotor) {
      Object.assign(payload, {
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        vehicle_year: Number(formData.vehicleYear),
        registration_number: formData.registrationNumber,
        fuel_type: formData.fuelType,
        vehicle_usage: formData.vehicleUsage,
        driving_experience_years: Number(formData.drivingExperience),
        no_claim_bonus_percent: Number(formData.noClaimBonus),
        prior_accident_claim: formData.priorAccident === "1" ? "yes" : "no",
      });
    } else {
      Object.assign(payload, {
        height_cm: Number(formData.height),
        weight_kg: Number(formData.weight),
        smoker: formData.smoker === "1" ? "yes" : "no",
        alcohol_consumption: { "0": "none", "1": "occasional", "2": "regular" }[formData.alcohol],
        pre_existing_disease: formData.preExistingDisease === "1" ? "yes" : "no",
        family_medical_history: formData.familyHistory === "1" ? "yes" : "no",
      });
    }

    try {
      setLoading(true);
      const data = await submitProposal(payload, docFile);
      setSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="client-confirm">
        <div className="client-confirm-card">
          <FaCheckCircle className="client-confirm-icon" />
          <h1>Proposal Submitted</h1>
          <p className="client-confirm-lead">
            Your application has been received and is now with an underwriter for review.
          </p>
          <div className="client-confirm-grid">
            <div>
              <span className="client-confirm-label">Reference ID</span>
              <span className="client-confirm-value mono">#{submitted.id}</span>
            </div>
            <div>
              <span className="client-confirm-label">Status</span>
              <span className="client-confirm-value">{submitted.status}</span>
            </div>
          </div>
          <p className="client-confirm-note">
            You'll be notified as soon as a decision is made. Keep your reference ID handy for any follow-up.
          </p>
          <BackButton to="/" label="Back to Home" />
        </div>
      </div>
    );
  }

  return (
    <div className="client-shell">
      {/* ---- Sticky left rail ---- */}
      <aside className="client-rail">
        <div className="client-rail-top">
          <BackButton to="/" />
          <div className="client-brand">
            <FaShieldAlt />
            <span>AI Underwriter</span>
          </div>
        </div>

        <div className="client-rail-heading">
          <h1>Insurance Proposal</h1>
          <p>Complete every section below. Your information is reviewed by an AI risk model and a human underwriter.</p>
        </div>

        <nav className="client-steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`client-step ${activeStep === s.id ? "client-step-active" : ""}`}
              onClick={() => scrollToStep(s.id)}
            >
              <span className="client-step-num">{s.icon}</span>
              <span className="client-step-label">
                <em>Step {i + 1}</em>
                {s.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="client-rail-footer">
          <p>Need help? Every field maps directly to your policy assessment — accuracy speeds up approval.</p>
        </div>
      </aside>

      {/* ---- Scrollable content ---- */}
      <main className="client-content">
        <form onSubmit={handleSubmit}>
          {/* ---- Document ---- */}
          <section id="document" className="client-section">
            <header className="client-section-head">
              <span className="client-section-tag">Step 1</span>
              <h2>Identity Document</h2>
              <p>Attach a driving license, national ID, or insurance certificate for verification.</p>
            </header>

            <div className="doc-upload-box">
              <div className="doc-select-row">
                <div className="form-group">
                  <label>Document Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setDocError(null);
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{COUNTRY_NAMES[c] || c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Document Type</label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => {
                      setSelectedDocType(e.target.value);
                      setDocError(null);
                    }}
                    disabled={!selectedCountry}
                  >
                    <option value="">
                      {selectedCountry ? "Select Document Type" : "Select country first"}
                    </option>
                    {docTypes.map((d) => (
                      <option key={d.doc_type} value={d.doc_type}>
                        {d.doc_name}
                      </option>
                    ))}
                  </select>
                  {docListError && (
                    <p className="doc-attached-note">Couldn't load document list: {docListError}</p>
                  )}
                </div>
              </div>

              <label className="doc-dropzone">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    setDocFile(e.target.files[0]);
                    setDocError(null);
                  }}
                />
                <FaFileUpload className="doc-dropzone-icon" />
                <span className="doc-dropzone-title">
                  {docFile ? docFile.name : "Click to attach a file"}
                </span>
                <span className="doc-dropzone-hint">PDF or image, up to a few MB</span>
              </label>

              {docFile && <p className="doc-attached-note doc-attached-ok"><FaCheckCircle /> Attached: {docFile.name}</p>}
              {docError && <div className="inline-error">{docError}</div>}
            </div>
          </section>

          {/* ---- Applicant ---- */}
          <section id="applicant" className="client-section">
            <header className="client-section-head">
              <span className="client-section-tag">Step 2</span>
              <h2>Applicant Details</h2>
              <p>Basic information about you and the coverage you're applying for.</p>
            </header>

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
                <label>{isMotor ? "Insured Declared Value (IDV)" : "Coverage Amount"}</label>
                <input type="number" name="sumAssured" value={formData.sumAssured} onChange={handleChange} placeholder={isMotor ? "Vehicle's current market value" : "Coverage Amount"} />
              </div>

              <div className="form-group">
                <label>Occupation</label>
                <select name="occupation" value={formData.occupation} onChange={handleChange}>
                  <option value="0">Office Job</option>
                  <option value="1">Field Job</option>
                  <option value="2">Hazardous Job</option>
                </select>
              </div>
            </div>
          </section>

          {/* ---- Details: Health & Lifestyle OR Vehicle Details ---- */}
          <section id="details" className="client-section">
            <header className="client-section-head">
              <span className="client-section-tag">Step 3</span>
              <h2>{isMotor ? "Vehicle Details" : "Health & Lifestyle"}</h2>
              <p>
                {isMotor
                  ? "Tell us about the vehicle you're insuring — this feeds directly into your AI risk assessment."
                  : "These factors feed directly into your AI risk assessment."}
              </p>
            </header>

            {!formData.insuranceType && (
              <p className="details-placeholder">
                Select an insurance type in Step 2 to see the relevant questions here.
              </p>
            )}

            {formData.insuranceType && !isMotor && (
              <>
                <div className="form-grid form-grid-3">
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
                    <input type="text" value={formData.bmi} readOnly placeholder="—" />
                  </div>
                </div>

                <div className="question-grid">
                  <div className="question-box">
                    <h3>Do you smoke?</h3>
                    <div className="radio-group">
                      <label><input type="radio" name="smoker" value="1" checked={formData.smoker === "1"} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="smoker" value="0" checked={formData.smoker === "0"} onChange={handleChange} /> No</label>
                    </div>
                  </div>

                  <div className="question-box">
                    <h3>Pre-existing disease?</h3>
                    <div className="radio-group">
                      <label><input type="radio" name="preExistingDisease" value="1" checked={formData.preExistingDisease === "1"} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="preExistingDisease" value="0" checked={formData.preExistingDisease === "0"} onChange={handleChange} /> No</label>
                    </div>
                  </div>

                  <div className="question-box">
                    <h3>Family history of major illness?</h3>
                    <div className="radio-group">
                      <label><input type="radio" name="familyHistory" value="1" checked={formData.familyHistory === "1"} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="familyHistory" value="0" checked={formData.familyHistory === "0"} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                </div>

                <div className="form-group standalone">
                  <label>Alcohol Consumption</label>
                  <select name="alcohol" value={formData.alcohol} onChange={handleChange}>
                    <option value="0">None</option>
                    <option value="1">Occasionally</option>
                    <option value="2">Regularly</option>
                  </select>
                </div>
              </>
            )}

            {formData.insuranceType && isMotor && (
              <>
                <div className="form-grid form-grid-3">
                  <div className="form-group">
                    <label>Vehicle Make</label>
                    <input type="text" name="vehicleMake" value={formData.vehicleMake} onChange={handleChange} placeholder="e.g. Maruti Suzuki" />
                  </div>

                  <div className="form-group">
                    <label>Vehicle Model</label>
                    <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} placeholder="e.g. Swift" />
                  </div>

                  <div className="form-group">
                    <label>Manufacturing Year</label>
                    <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} placeholder="e.g. 2021" />
                  </div>
                </div>

                <div className="form-grid form-grid-3 form-grid-spaced">
                  <div className="form-group">
                    <label>Registration Number</label>
                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="e.g. TN09AB1234" />
                  </div>

                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="cng">CNG</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Vehicle Usage</label>
                    <select name="vehicleUsage" value={formData.vehicleUsage} onChange={handleChange}>
                      <option value="personal">Personal</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid form-grid-spaced">
                  <div className="form-group">
                    <label>Driving Experience (years)</label>
                    <input type="number" name="drivingExperience" value={formData.drivingExperience} onChange={handleChange} placeholder="e.g. 6" />
                  </div>

                  <div className="form-group">
                    <label>No-Claim Bonus (%)</label>
                    <input type="number" name="noClaimBonus" value={formData.noClaimBonus} onChange={handleChange} placeholder="e.g. 20" />
                  </div>
                </div>

                <div className="question-grid question-grid-single">
                  <div className="question-box">
                    <h3>Any accident or claim in the last 3 years?</h3>
                    <div className="radio-group">
                      <label><input type="radio" name="priorAccident" value="1" checked={formData.priorAccident === "1"} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="priorAccident" value="0" checked={formData.priorAccident === "0"} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* ---- Financial ---- */}
          <section id="financial" className="client-section client-section-last">
            <header className="client-section-head">
              <span className="client-section-tag">Step 4</span>
              <h2>Financial Profile</h2>
              <p>Your history with insurers helps refine the underwriting decision.</p>
            </header>

            <div className="form-grid form-grid-3">
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

            {error && <div className="inline-error inline-error-block"><b>Error:</b> {error}</div>}
          </section>

          {/* ---- Sticky submit bar ---- */}
          <div className="client-submit-bar">
            <p>Review your details, then submit for AI underwriting.</p>
            <button className="submit-btn" type="submit" disabled={loading}>
              {loading ? "Submitting…" : "Submit Proposal for AI Underwriting"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default ClientDashboard;
