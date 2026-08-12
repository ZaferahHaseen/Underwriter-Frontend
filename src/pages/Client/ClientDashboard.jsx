import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaFileUpload,
  FaUserAlt,
  FaHeartbeat,
  FaWallet,
} from "react-icons/fa";

import "./ClientDashboard.css";
import {
  submitProposal,
  getCountries,
  getDocTypesForCountry,
} from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";

const COUNTRY_NAMES = {
  AE: "United Arab Emirates",
  IN: "India",
  KE: "Kenya",
  NG: "Nigeria",
  ZA: "South Africa",
};

const SECTION_IDS = ["document", "applicant", "details", "financial"];

function ClientDashboard() {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    annualIncome: "",
    sumAssured: "",

    // Health & lifestyle
    height: "",
    weight: "",
    bmi: "",
    smoker: "0",
    alcohol: "0",
    preExistingDisease: "0",
    familyHistory: "0",
    occupation: "0",

    // Financial
    creditScore: "",
    previousClaims: "",
    yearsWithInsurer: "",
  });

  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Document
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState(null);

  // Country / document type
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [docTypes, setDocTypes] = useState([]);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [docListError, setDocListError] = useState(null);

  const [activeStep, setActiveStep] = useState("document");

  // --------------------------------------------------
  // Steps
  // --------------------------------------------------

  const STEPS = [
    {
      id: "document",
      label: "Identity Document",
      icon: <FaFileUpload />,
    },
    {
      id: "applicant",
      label: "Applicant Details",
      icon: <FaUserAlt />,
    },
    {
      id: "details",
      label: "Health & Lifestyle",
      icon: <FaHeartbeat />,
    },
    {
      id: "financial",
      label: "Financial Profile",
      icon: <FaWallet />,
    },
  ];

  // --------------------------------------------------
  // Load countries
  // --------------------------------------------------

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch((err) => setDocListError(err.message));
  }, []);

  // --------------------------------------------------
  // Load document types
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Auto calculate BMI
  // --------------------------------------------------

  useEffect(() => {
    if (formData.height && formData.weight) {
      const h = Number(formData.height) / 100;

      if (h > 0) {
        const bmi = (Number(formData.weight) / (h * h)).toFixed(1);

        setFormData((prev) => ({
          ...prev,
          bmi,
        }));
      }
    }
  }, [formData.height, formData.weight]);

  // --------------------------------------------------
  // Detect active section while scrolling
  // --------------------------------------------------

  useEffect(() => {
    const sections = SECTION_IDS.map((id) =>
      document.getElementById(id)
    ).filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-15% 0px -70% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // --------------------------------------------------
  // Handle field changes
  // --------------------------------------------------

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // --------------------------------------------------
  // Scroll to section
  // --------------------------------------------------

  const scrollToStep = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // --------------------------------------------------
  // Submit proposal
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setDocError(null);
    setSubmitted(null);

    // Document validation
    if (!docFile) {
      setDocError("Attach your ID / certificate before submitting.");
      scrollToStep("document");
      return;
    }

    if (!selectedCountry || !selectedDocType) {
      setDocError(
        "Select the document's country and type before submitting."
      );
      scrollToStep("document");
      return;
    }

    const country_code = selectedCountry;
    const doc_type = selectedDocType;

    // --------------------------------------------------
    // HEALTH INSURANCE PAYLOAD
    // --------------------------------------------------

    const payload = {
      full_name: formData.fullName,
      insurance_type: "Health Insurance",

      age: Number(formData.age),
      annual_income: Number(formData.annualIncome),
      sum_assured: Number(formData.sumAssured),

      occupation: {
        "0": "office",
        "1": "field",
        "2": "hazardous",
      }[formData.occupation],

      credit_score: Number(formData.creditScore),
      num_previous_claims: Number(formData.previousClaims),
      years_with_insurer: Number(formData.yearsWithInsurer),

      country_code,
      doc_type,

      // Health fields
      height_cm: Number(formData.height),
      weight_kg: Number(formData.weight),

      smoker:
        formData.smoker === "1"
          ? "yes"
          : "no",

      alcohol_consumption: {
        "0": "none",
        "1": "occasional",
        "2": "regular",
      }[formData.alcohol],

      pre_existing_disease:
        formData.preExistingDisease === "1"
          ? "yes"
          : "no",

      family_medical_history:
        formData.familyHistory === "1"
          ? "yes"
          : "no",
    };

    try {
      setLoading(true);

      const data = await submitProposal(
        payload,
        docFile
      );

      setSubmitted(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Success screen
  // --------------------------------------------------

  if (submitted) {
    return (
      <div className="client-confirm">
        <div className="client-confirm-card">

          <FaCheckCircle className="client-confirm-icon" />

          <h1>Proposal Submitted</h1>

          <p className="client-confirm-lead">
            Your health insurance application has been
            received and is now with an underwriter for
            review.
          </p>

          <div className="client-confirm-grid">

            <div>
              <span className="client-confirm-label">
                Reference ID
              </span>

              <span className="client-confirm-value mono">
                #{submitted.id}
              </span>
            </div>

            <div>
              <span className="client-confirm-label">
                Status
              </span>

              <span className="client-confirm-value">
                {submitted.status}
              </span>
            </div>

          </div>

          <p className="client-confirm-note">
            You'll be notified as soon as a decision is
            made. Keep your reference ID handy for any
            follow-up.
          </p>

          <BackButton
            to="/"
            label="Back to Home"
          />

        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // Main form
  // --------------------------------------------------

  return (
    <div className="client-shell">

      {/* ==============================================
          LEFT SIDEBAR
      =============================================== */}

      <aside className="client-rail">

        <div className="client-rail-top">

          <BackButton to="/client/home" />

          <div className="client-brand">
            <FaShieldAlt />
            <span>AI Underwriter</span>
          </div>

          <TopBar homeTo="/client/home" />

        </div>

        <div className="client-rail-heading">

          <h1>Health Insurance Proposal</h1>

          <p>
            Complete every section below. Your information
            is reviewed by an AI risk model and a human
            underwriter.
          </p>

        </div>

        <nav className="client-steps">

          {STEPS.map((step, index) => (

            <button
              key={step.id}
              type="button"
              className={`client-step ${
                activeStep === step.id
                  ? "client-step-active"
                  : ""
              }`}
              onClick={() => scrollToStep(step.id)}
            >

              <span className="client-step-num">
                {step.icon}
              </span>

              <span className="client-step-label">

                <em>
                  Step {index + 1}
                </em>

                {step.label}

              </span>

            </button>

          ))}

        </nav>

        <div className="client-rail-footer">

          <p>
            Need help? Every field maps directly to your
            policy assessment — accuracy speeds up approval.
          </p>

        </div>

      </aside>

      {/* ==============================================
          MAIN CONTENT
      =============================================== */}

      <main className="client-content">

        <form onSubmit={handleSubmit}>

          {/* ============================================
              STEP 1 — DOCUMENT
          ============================================= */}

          <section
            id="document"
            className="client-section"
          >

            <header className="client-section-head">

              <span className="client-section-tag">
                Step 1
              </span>

              <h2>Identity Document</h2>

              <p>
                Attach a driving license, national ID, or
                insurance certificate for verification.
              </p>

            </header>

            <div className="doc-upload-box">

              <div className="doc-select-row">

                <div className="form-group">

                  <label>
                    Document Country
                  </label>

                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setDocError(null);
                    }}
                  >

                    <option value="">
                      Select Country
                    </option>

                    {countries.map((country) => (

                      <option
                        key={country}
                        value={country}
                      >
                        {COUNTRY_NAMES[country] || country}
                      </option>

                    ))}

                  </select>

                </div>

                <div className="form-group">

                  <label>
                    Document Type
                  </label>

                  <select
                    value={selectedDocType}
                    onChange={(e) => {
                      setSelectedDocType(e.target.value);
                      setDocError(null);
                    }}
                    disabled={!selectedCountry}
                  >

                    <option value="">
                      {selectedCountry
                        ? "Select Document Type"
                        : "Select country first"}
                    </option>

                    {docTypes.map((doc) => (

                      <option
                        key={doc.doc_type}
                        value={doc.doc_type}
                      >
                        {doc.doc_name}
                      </option>

                    ))}

                  </select>

                  {docListError && (
                    <p className="doc-attached-note">
                      Couldn't load document list:{" "}
                      {docListError}
                    </p>
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
                  {docFile
                    ? docFile.name
                    : "Click to attach a file"}
                </span>

                <span className="doc-dropzone-hint">
                  PDF or image, up to a few MB
                </span>

              </label>

              {docFile && (
                <p className="doc-attached-note doc-attached-ok">
                  <FaCheckCircle />
                  Attached: {docFile.name}
                </p>
              )}

              {docError && (
                <div className="inline-error">
                  {docError}
                </div>
              )}

            </div>

          </section>

          {/* ============================================
              STEP 2 — APPLICANT DETAILS
          =============================================== */}

          <section
            id="applicant"
            className="client-section"
          >

            <header className="client-section-head">

              <span className="client-section-tag">
                Step 2
              </span>

              <h2>Applicant Details</h2>

              <p>
                Basic information about you and the
                coverage you're applying for.
              </p>

            </header>

            <div className="form-grid">

              {/* NO INSURANCE TYPE FIELD */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter Full Name"
                />

              </div>

              <div className="form-group">

                <label>
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter Age"
                />

              </div>

              <div className="form-group">

                <label>
                  Annual Income
                </label>

                <input
                  type="number"
                  name="annualIncome"
                  value={formData.annualIncome}
                  onChange={handleChange}
                  placeholder="Annual Income"
                />

              </div>

              <div className="form-group">

                <label>
                  Coverage Amount
                </label>

                <input
                  type="number"
                  name="sumAssured"
                  value={formData.sumAssured}
                  onChange={handleChange}
                  placeholder="Coverage Amount"
                />

              </div>

              <div className="form-group">

                <label>
                  Occupation
                </label>

                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                >

                  <option value="0">
                    Office Job
                  </option>

                  <option value="1">
                    Field Job
                  </option>

                  <option value="2">
                    Hazardous Job
                  </option>

                </select>

              </div>

            </div>

          </section>

          {/* ============================================
              STEP 3 — HEALTH & LIFESTYLE
          =============================================== */}

          <section
            id="details"
            className="client-section"
          >

            <header className="client-section-head">

              <span className="client-section-tag">
                Step 3
              </span>

              <h2>
                Health & Lifestyle
              </h2>

              <p>
                These factors feed directly into your AI
                risk assessment.
              </p>

            </header>

            {/* BMI */}

            <div className="form-grid form-grid-3">

              <div className="form-group">

                <label>
                  Height (cm)
                </label>

                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height"
                />

              </div>

              <div className="form-group">

                <label>
                  Weight (kg)
                </label>

                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight"
                />

              </div>

              <div className="form-group">

                <label>
                  BMI (Auto Calculated)
                </label>

                <input
                  type="text"
                  value={formData.bmi}
                  readOnly
                  placeholder="—"
                />

              </div>

            </div>

            {/* Health questions */}

            <div className="question-grid">

              <div className="question-box">

                <h3>
                  Do you smoke?
                </h3>

                <div className="radio-group">

                  <label>
                    <input
                      type="radio"
                      name="smoker"
                      value="1"
                      checked={
                        formData.smoker === "1"
                      }
                      onChange={handleChange}
                    />
                    Yes
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="smoker"
                      value="0"
                      checked={
                        formData.smoker === "0"
                      }
                      onChange={handleChange}
                    />
                    No
                  </label>

                </div>

              </div>

              <div className="question-box">

                <h3>
                  Pre-existing disease?
                </h3>

                <div className="radio-group">

                  <label>
                    <input
                      type="radio"
                      name="preExistingDisease"
                      value="1"
                      checked={
                        formData.preExistingDisease === "1"
                      }
                      onChange={handleChange}
                    />
                    Yes
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="preExistingDisease"
                      value="0"
                      checked={
                        formData.preExistingDisease === "0"
                      }
                      onChange={handleChange}
                    />
                    No
                  </label>

                </div>

              </div>

              <div className="question-box">

                <h3>
                  Family history of major illness?
                </h3>

                <div className="radio-group">

                  <label>
                    <input
                      type="radio"
                      name="familyHistory"
                      value="1"
                      checked={
                        formData.familyHistory === "1"
                      }
                      onChange={handleChange}
                    />
                    Yes
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="familyHistory"
                      value="0"
                      checked={
                        formData.familyHistory === "0"
                      }
                      onChange={handleChange}
                    />
                    No
                  </label>

                </div>

              </div>

            </div>

            {/* Alcohol */}

            <div className="form-group standalone">

              <label>
                Alcohol Consumption
              </label>

              <select
                name="alcohol"
                value={formData.alcohol}
                onChange={handleChange}
              >

                <option value="0">
                  None
                </option>

                <option value="1">
                  Occasionally
                </option>

                <option value="2">
                  Regularly
                </option>

              </select>

            </div>

          </section>

          {/* ============================================
              STEP 4 — FINANCIAL
          =============================================== */}

          <section
            id="financial"
            className="client-section client-section-last"
          >

            <header className="client-section-head">

              <span className="client-section-tag">
                Step 4
              </span>

              <h2>
                Financial Profile
              </h2>

              <p>
                Your history with insurers helps refine
                the underwriting decision.
              </p>

            </header>

            <div className="form-grid form-grid-3">

              <div className="form-group">

                <label>
                  Credit Score
                </label>

                <input
                  type="number"
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleChange}
                  placeholder="e.g. 750"
                />

              </div>

              <div className="form-group">

                <label>
                  Previous Claims
                </label>

                <input
                  type="number"
                  name="previousClaims"
                  value={formData.previousClaims}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                />

              </div>

              <div className="form-group">

                <label>
                  Years With Insurer
                </label>

                <input
                  type="number"
                  name="yearsWithInsurer"
                  value={formData.yearsWithInsurer}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                />

              </div>

            </div>

            {error && (
              <div className="inline-error inline-error-block">
                <b>Error:</b> {error}
              </div>
            )}

          </section>

          {/* ============================================
              SUBMIT BAR
          =============================================== */}

          <div className="client-submit-bar">

            <p>
              Review your details, then submit for AI
              underwriting.
            </p>

            <button
              className="submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Submitting…"
                : "Submit Proposal for AI Underwriting"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default ClientDashboard;
