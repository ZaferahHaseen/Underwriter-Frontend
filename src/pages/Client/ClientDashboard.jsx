import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaFileUpload,
  FaUserAlt,
  FaHeartbeat,
  FaWallet,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import "./ClientDashboard.css";
import {
  submitProposal,
  editProposal,
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

// Free-text/number fields that must not be left blank. (The radio-style
// fields — smoker, alcohol, occupation, etc. — always default to a
// selected value, so they can never be blank.)
const REQUIRED_FIELDS = [
  { key: "fullName", label: "Full Name" },
  { key: "age", label: "Age" },
  { key: "annualIncome", label: "Annual Income" },
  { key: "sumAssured", label: "Coverage Amount" },
  { key: "height", label: "Height" },
  { key: "weight", label: "Weight" },
  { key: "creditScore", label: "Credit Score" },
  { key: "previousClaims", label: "Previous Claims" },
  { key: "yearsWithInsurer", label: "Years With Insurer" },
];


function ClientDashboard() {
  const [searchParams] = useSearchParams();

  const isEditMode = searchParams.get("edit") === "true";

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
  const [editingProposalId, setEditingProposalId] = useState(null);

  // Snapshot of the form as it was loaded for editing — used to block
  // re-submitting an edit when the client changed nothing at all.
  const [originalFormData, setOriginalFormData] = useState(null);

    // --------------------------------------------------
  // Load existing policy when editing
  // --------------------------------------------------

  useEffect(() => {
    if (!isEditMode) return;

    const storedPolicy = sessionStorage.getItem(
      "editing_client_policy"
    );

    if (!storedPolicy) return;

    try {
      const policy = JSON.parse(storedPolicy);

      const details =
        policy.proposal_data ||
        policy.proposal_details ||
        policy.details ||
        policy;

      // Real (backend-fetched) proposals carry their own id under
      // proposal_details.id — that's the one PATCH/edit needs, NOT the
      // outer policy.id (which is the summary row's id, same value here
      // but kept separate for clarity / dummy-data safety).
      if (details && details.id) {
        setEditingProposalId(details.id);
      } else if (policy.id && typeof policy.id === "number") {
        setEditingProposalId(policy.id);
      }

      setFormData((previous) => {
        const next = {
        ...previous,

        fullName:
          details.full_name ??
          details.fullName ??
          previous.fullName,

        age:
          details.age ??
          previous.age,

        annualIncome:
          details.annual_income ??
          details.annualIncome ??
          previous.annualIncome,

        sumAssured:
          details.sum_assured ??
          details.sumAssured ??
          previous.sumAssured,

        height:
          details.height_cm ??
          details.height ??
          previous.height,

        weight:
          details.weight_kg ??
          details.weight ??
          previous.weight,

        smoker:
          details.smoker === "yes"
            ? "1"
            : details.smoker === "no"
            ? "0"
            : details.smoker ??
              previous.smoker,

        alcohol:
          details.alcohol_consumption === "none"
            ? "0"
            : details.alcohol_consumption === "occasional"
            ? "1"
            : details.alcohol_consumption === "regular"
            ? "2"
            : details.alcohol ??
              previous.alcohol,

        preExistingDisease:
          details.pre_existing_disease === "yes"
            ? "1"
            : details.pre_existing_disease === "no"
            ? "0"
            : details.preExistingDisease ??
              previous.preExistingDisease,

        familyHistory:
          details.family_medical_history === "yes"
            ? "1"
            : details.family_medical_history === "no"
            ? "0"
            : details.familyHistory ??
              previous.familyHistory,

        occupation:
          details.occupation === "office"
            ? "0"
            : details.occupation === "field"
            ? "1"
            : details.occupation === "hazardous"
            ? "2"
            : details.occupation ??
              previous.occupation,

        creditScore:
          details.credit_score ??
          details.creditScore ??
          previous.creditScore,

        previousClaims:
          details.num_previous_claims ??
          details.previousClaims ??
          previous.previousClaims,

        yearsWithInsurer:
          details.years_with_insurer ??
          details.yearsWithInsurer ??
          previous.yearsWithInsurer,
        };

        setOriginalFormData(next);
        return next;
      });

      // Restore document information if available
      if (details.country_code) {
        setSelectedCountry(details.country_code);
      }

      if (details.doc_type) {
        setSelectedDocType(details.doc_type);
      }

    } catch (err) {
      console.error(
        "Unable to load policy for editing:",
        err
      );
    }
  }, [isEditMode]);

  // Document
  const [docFile, setDocFile] = useState(null);
  const [docError, setDocError] = useState(null);

  // Mini popup (toast) for docError / error — auto-dismisses after 4s.
  const toastMessage = error || docError;
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => {
      setError(null);
      setDocError(null);
    }, 4000);
    return () => clearTimeout(t);
  }, [toastMessage]);

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
  // Position-based instead of IntersectionObserver: on every scroll we
  // find the section whose top has most recently passed a fixed
  // "trigger line" near the top of the viewport. This is deterministic
  // (always reflects exactly what's under the trigger line) and avoids
  // IntersectionObserver rootMargin edge cases where a section's
  // heading is visible but the observer hasn't fired an update yet.

  useEffect(() => {
    const TRIGGER_OFFSET = 160; // px from top of viewport

    const handleScroll = () => {
      let current = SECTION_IDS[0];

      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;

        const top = el.getBoundingClientRect().top;
        if (top - TRIGGER_OFFSET <= 0) {
          current = id;
        }
      }

      setActiveStep(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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

    // Client-side required-field check — catches blank fields immediately
    // instead of relying on the backend, since some fields (e.g. Years
    // With Insurer, Previous Claims) allow 0 as a valid value, so an
    // empty box never trips the backend's own validation.
    const missing = REQUIRED_FIELDS.filter((f) => String(formData[f.key]).trim() === "");
    if (missing.length > 0) {
      setError(
        missing.length > 2
          ? "Please fill in all the details in the form before submitting."
          : `Please fill in: ${missing.map((f) => f.label).join(", ")}.`
      );
      scrollToStep(missing[0].key === "fullName" || missing[0].key === "age" || missing[0].key === "annualIncome" || missing[0].key === "sumAssured" ? "applicant" : missing[0].key === "height" || missing[0].key === "weight" ? "details" : "financial");
      return;
    }

    // Document validation
    

    if (!docFile && !isEditMode) {
      setDocError("Attach your ID / certificate before submitting.");
      scrollToStep("document");
      return;
    }

    


    if (
      (!selectedCountry || !selectedDocType) &&
      !isEditMode
    ) {
      setDocError(
        "Select the document's country and type before submitting."
      );
      scrollToStep("document");
      return;
    }

    // No-op edit guard — client opened the edit form but changed nothing.
    // Resubmitting an identical payload just creates a duplicate/no-op
    // version server-side, so block it here instead.
    // (bmi excluded — it's auto-derived from height/weight by a separate
    // effect and re-fires on load, so comparing it causes false positives.)
    if (
      isEditMode &&
      editingProposalId &&
      originalFormData &&
      JSON.stringify({ ...formData, bmi: undefined }) ===
        JSON.stringify({ ...originalFormData, bmi: undefined })
    ) {
      setError(
        "You haven't made any changes. Edit at least one field before submitting, or go back."
      );
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

      // Edit mode -> POST /api/v1/proposals/{id}/edit (new version, no
      // re-upload of the document). Otherwise -> POST /api/v1/proposals
      // (new proposal, document required).
      const data =
        isEditMode && editingProposalId
          ? await editProposal(editingProposalId, payload)
          : await submitProposal(payload, docFile);

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

      {toastMessage && (
        <div className="cd-toast" role="alert">
          <FaExclamationCircle className="cd-toast-icon" />
          <span>{toastMessage}</span>
          <button
            type="button"
            className="cd-toast-close"
            onClick={() => { setError(null); setDocError(null); }}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      )}

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

          <h1>
            {isEditMode
              ? "Edit Health Insurance Proposal"
              : "Health Insurance Proposal"}
          </h1>

          
          <p>
            {isEditMode
              ? "Review and update the information you previously submitted."
              : "Complete every section below. Your information is reviewed by an AI risk model and a human underwriter."}
          </p>

        </div>

        <nav className="client-steps">

          {STEPS.map((step, index) => {
            const activeIndex = STEPS.findIndex((s) => s.id === activeStep);
            const isActive = activeStep === step.id;
            const isCompleted = activeIndex > index;

            return (
              <button
                key={step.id}
                type="button"
                className={`client-step ${isActive ? "client-step-active" : ""} ${
                  isCompleted ? "client-step-done" : ""
                }`}
                onClick={() => scrollToStep(step.id)}
              >

                <span className="client-step-num">
                  {isCompleted ? <FaCheckCircle /> : step.icon}
                </span>

                <span className="client-step-label">

                  <em>
                    Step {index + 1}
                  </em>

                  {step.label}

                </span>

              </button>
            );
          })}

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
                  placeholder="Add height & weight"
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
                ? isEditMode
                  ? "Saving…"
                  : "Submitting…"
                : isEditMode
                  ? "Save Updated Details"
                  : "Submit Proposal for AI Underwriting"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default ClientDashboard;