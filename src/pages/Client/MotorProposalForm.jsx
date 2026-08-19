import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaPlus,
  FaFileExcel,
  FaEdit,
  FaCheckCircle,
  FaArrowLeft,
  FaCarSide,
  FaTrashAlt,
  FaSave,
  FaTimes,
  FaShieldAlt,
  FaUserAlt,
  FaMapMarkerAlt,
  FaFileContract,
  FaExclamationCircle,
} from "react-icons/fa";

import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";
import VehicleFormBlock from "../../components/VehicleFormBlock";
import ExcelUploadPanel from "../../components/ExcelUploadPanel";
import {
  emptyVehicle,
  validateVehicle,
  FIELD_SECTIONS,
  ALL_FIELD_KEYS,
} from "../../data/motorFormFields";
import { submitVehicleProposalsBatch, editVehicleProposal } from "../../api/underwritingApi";

import "./MotorProposalForm.css";

// Field keys here match RawVehicleProposalRequest on the backend exactly
// (app/vehicle/schemas.py) except these three, which the model expects as
// numbers but HTML inputs always hand back as strings.
const NUMERIC_KEYS = [
  "year", "engine_cc", "vehicle_value", "driver_age", "driving_experience",
  "license_age", "previous_accidents", "previous_claims", "traffic_violations",
  "annual_mileage", "policy_lapses",
];

function toBackendVehicle(v) {
  const out = { ...v };
  NUMERIC_KEYS.forEach((k) => { out[k] = Number(out[k]); });
  return out;
}

// Left-rail step nav, mirroring the Health proposal page — one entry per
// section inside the currently-open VehicleFormBlock (see FIELD_SECTIONS
// in data/motorFormFields.js). Icons are matched by section title.
const STEP_ICONS = {
  "Vehicle Details": <FaCarSide />,
  "Driver Details": <FaUserAlt />,
  "Usage & Location": <FaMapMarkerAlt />,
  "Insurance History": <FaFileContract />,
};

function slugify(title) {
  return title.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const STEPS = FIELD_SECTIONS.map((section) => ({
  id: `mpf-step-${slugify(section.title)}`,
  label: section.title,
  icon: STEP_ICONS[section.title] || <FaCarSide />,
}));

function MotorProposalForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [mode, setMode] = useState("manual");

  // Name of the person the policy is FOR (may differ from the logged-in
  // account — broker/family submissions). Separate from any one vehicle.
  const [applicantFullName, setApplicantFullName] = useState("");
  const [applicantNameTouched, setApplicantNameTouched] = useState(false);

  // All vehicles that have already been saved
  const [savedVehicles, setSavedVehicles] = useState([]);

  // The ONE vehicle currently being edited/filled
  const [currentVehicle, setCurrentVehicle] = useState(emptyVehicle());

  // null = creating a new vehicle
  // number = editing an already saved vehicle
  const [editingIndex, setEditingIndex] = useState(null);

  // Real backend proposal id being edited (from ClientMotorPolicy "View" ->
  // edit=true flow). null = this is a brand-new batch submission.
  // Separate from `editingIndex` (which is local-form-only, per-vehicle-in-list).
  const [editingProposalId, setEditingProposalId] = useState(null);

  // Snapshot of the vehicle as it was loaded for editing — used to block
  // re-submitting an edit when the client changed nothing at all.
  const [originalVehicle, setOriginalVehicle] = useState(null);

  const [currentErrors, setCurrentErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeStep, setActiveStep] = useState(STEPS[0]?.id);

  // Mini popup (toast) replacing native alert() for validation/error messages.
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // --------------------------------------------------
  // Coming here from "View" on the client's vehicle list —
  // load that vehicle straight into the edit form so its
  // already-entered details are shown and can be updated.
  // --------------------------------------------------
  useEffect(() => {
    if (searchParams.get("edit") !== "true") return;

    const stored = sessionStorage.getItem("editing_client_vehicle");
    if (!stored) return;

    try {
      const raw = JSON.parse(stored);

      // Only pull in the fields this form actually knows about —
      // administrative fields like policy_number/registration_number
      // aren't part of the proposal form and are left out.
      const mapped = ALL_FIELD_KEYS.reduce((obj, key) => {
        obj[key] = raw[key] !== undefined && raw[key] !== null ? raw[key] : "";
        return obj;
      }, {});

      setSavedVehicles([mapped]);
      setCurrentVehicle(mapped);
      setOriginalVehicle(mapped);
      setEditingIndex(0);
      // raw.id = the real vehicle proposal id (set by ClientMotorPolicy.jsx's
      // handleViewVehicle). Without this, Submit had no way to know it should
      // call the edit endpoint instead of creating a brand-new proposal.
      if (raw.id != null) setEditingProposalId(raw.id);
    } catch {
      // Ignore malformed/missing data and just show a blank form.
    } finally {
      sessionStorage.removeItem("editing_client_vehicle");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // Detect active section while scrolling (mirrors ClientDashboard)
  // --------------------------------------------------
  useEffect(() => {
    if (mode !== "manual") return;

    const sections = STEPS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveStep(entry.target.id);
          }
        });
      },
      { root: document.querySelector(".mpf-content"), rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [mode, editingIndex, savedVehicles.length]);

  const scrollToStep = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* =========================================================
     CURRENT VEHICLE
     ========================================================= */

  const updateCurrentVehicle = (key, value) => {
    setCurrentVehicle((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (currentErrors[key]) {
      setCurrentErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  /* =========================================================
     SAVE / UPDATE VEHICLE
     ========================================================= */

  const saveVehicle = () => {
    setSubmitAttempted(true);

    const errors = validateVehicle(currentVehicle);
    setCurrentErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstBad = document.querySelector(".vfb-input-error");
      firstBad?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (editingIndex !== null) {
      setSavedVehicles((prev) =>
        prev.map((vehicle, index) => (index === editingIndex ? { ...currentVehicle } : vehicle))
      );
    } else {
      setSavedVehicles((prev) => [...prev, { ...currentVehicle }]);
    }

    setCurrentVehicle(emptyVehicle());
    setCurrentErrors({});
    setSubmitAttempted(false);
    setEditingIndex(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================================================
     EDIT SAVED VEHICLE
     ========================================================= */

  const editVehicle = (index) => {
    const vehicle = savedVehicles[index];

    setCurrentVehicle({ ...vehicle });
    setEditingIndex(index);
    setCurrentErrors({});
    setSubmitAttempted(false);

    setTimeout(() => {
      document.querySelector(".mpf-current-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  /* =========================================================
     CANCEL EDIT
     ========================================================= */

  const cancelEdit = () => {
    setCurrentVehicle(emptyVehicle());
    setCurrentErrors({});
    setSubmitAttempted(false);
    setEditingIndex(null);

    setTimeout(() => {
      document.querySelector(".mpf-current-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  /* =========================================================
     DELETE SAVED VEHICLE
     ========================================================= */

  const removeSavedVehicle = (index) => {
    setSavedVehicles((prev) => prev.filter((_, i) => i !== index));

    if (editingIndex === index) {
      cancelEdit();
      return;
    }

    if (editingIndex !== null && index < editingIndex) {
      setEditingIndex((prev) => prev - 1);
    }
  };

  /* =========================================================
     EXCEL IMPORT
     ========================================================= */

  const handleExcelImport = (importedVehicles) => {
    if (!importedVehicles || importedVehicles.length === 0) {
      return;
    }

    setSavedVehicles((prev) => [...prev, ...importedVehicles]);

    setCurrentVehicle(emptyVehicle());
    setCurrentErrors({});
    setSubmitAttempted(false);
    setEditingIndex(null);

    setMode("manual");

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  /* =========================================================
     FINAL SUBMISSION
     ========================================================= */

  const handleSubmit = async () => {
    if (savedVehicles.length === 0) {
      setSubmitAttempted(true);
      setToast("Please save at least one vehicle before submitting.");
      return;
    }

    // Applicant name only required for a NEW (batch) submission. An edit
    // updates an existing proposal in place and keeps its original name —
    // there's nothing to collect here.
    if (editingProposalId == null && !applicantFullName.trim()) {
      setApplicantNameTouched(true);
      setToast("Please enter the applicant's full name.");
      document.querySelector(".mpf-applicant-name")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Guard: if a vehicle is currently open for editing and its fields
    // were changed but "Update Vehicle" was never clicked, those changes
    // only live in currentVehicle — savedVehicles (what actually gets
    // sent) still has the old values. Block submit instead of silently
    // sending stale data.
    if (
      editingIndex !== null &&
      JSON.stringify(currentVehicle) !== JSON.stringify(savedVehicles[editingIndex])
    ) {
      setToast(
        "You have unsaved changes to this vehicle. Click \"Update Vehicle\" before submitting the proposal."
      );
      document.querySelector(".mpf-current-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const allErrors = savedVehicles.map((vehicle) => validateVehicle(vehicle));
    const hasErrors = allErrors.some((errors) => Object.keys(errors).length > 0);

    if (hasErrors) {
      setToast("One or more saved vehicles contain invalid details. Please edit and correct them before submitting.");
      return;
    }

    // No-op edit guard — client opened the edit form but changed nothing.
    // Resubmitting an identical vehicle just creates a duplicate/no-op
    // version server-side, so block it here instead.
    if (
      editingProposalId != null &&
      originalVehicle &&
      JSON.stringify(savedVehicles[0]) === JSON.stringify(originalVehicle)
    ) {
      setToast("You haven't made any changes. Edit at least one field before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingProposalId != null) {
        // WIRED TO BACKEND: POST /api/v1/vehicle/proposals/{id}/edit
        // (app/vehicle/router.py) — updates the existing proposal + vehicle
        // rows in place (same id, same policy number), pre-edit values are
        // snapshotted server-side for history. Edit mode only ever holds
        // the single vehicle that was loaded for editing.
        await editVehicleProposal(editingProposalId, toBackendVehicle(savedVehicles[0]));
      } else {
        // WIRED TO BACKEND: POST /api/v1/vehicle/proposals/batch
        // (app/vehicle/batch_router.py) — one call, N independent vehicle
        // proposals created, each scored by the real vehicle risk model.
        // NOTE: this endpoint always returns HTTP 200 even when every
        // vehicle failed (e.g. duplicate) — per-item outcome is in
        // data.results, so it has to be checked here instead of relying
        // on a thrown error.
        const payload = savedVehicles.map(toBackendVehicle);
        const data = await submitVehicleProposalsBatch(applicantFullName.trim(), payload);

        if (data.created === 0) {
          const firstReason = data.results?.find((r) => r.status === "error")?.reason;
          setToast(firstReason || "None of the vehicles could be submitted. Please review and try again.");
          setSubmitting(false);
          return;
        }

        if (data.skipped_or_failed > 0) {
          const firstReason = data.results?.find((r) => r.status === "error")?.reason;
          setToast(
            `${data.created} of ${data.total} vehicle(s) submitted. ${data.skipped_or_failed} skipped: ${firstReason || "see details"}`
          );
        }
      }
      setSubmitted(true);
    } catch (err) {
      setToast(err.message || "Could not submit your proposal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  if (submitted) {
    return (
      <div className="mpf-page mpf-success-page">
        <div className="mpf-success-card">
          <FaCheckCircle className="mpf-success-icon" />
          <h1>Proposal Submitted</h1>
          <p>
            {savedVehicles.length === 1
              ? "Your vehicle proposal has been submitted for review."
              : `Your proposals for ${savedVehicles.length} vehicles have been submitted for review.`}
          </p>
          <p className="mpf-success-sub">
            An underwriter will review the details and update your policy status shortly.
          </p>
          <button className="mpf-success-btn" onClick={() => navigate("/client/motor")}>
            <FaArrowLeft />
            Back to My Vehicles
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN PAGE
     ========================================================= */

  return (
    <div className="mpf-shell">

      {toast && (
        <div className="mpf-toast" role="alert">
          <FaExclamationCircle className="mpf-toast-icon" />
          <span>{toast}</span>
          <button
            type="button"
            className="mpf-toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* =====================================================
          LEFT SIDEBAR (mirrors the Health proposal page)
          ===================================================== */}

      <aside className="mpf-rail">

        <div className="mpf-rail-top">
          <BackButton to="/client/motor" />
          <div className="mpf-brand">
            <FaShieldAlt />
            <span>AI Underwriter</span>
          </div>
          <TopBar homeTo="/client/home" />
        </div>

        <div className="mpf-rail-heading">
          <h1>Motor Insurance Proposal</h1>
          <p>
            Add your vehicles one at a time, save them,
            and submit the complete proposal when you're ready.
          </p>
        </div>

        {mode === "manual" && (
          <nav className="mpf-steps">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                className={`mpf-step ${activeStep === step.id ? "mpf-step-active" : ""}`}
                onClick={() => scrollToStep(step.id)}
              >
                <span className="mpf-step-num">{step.icon}</span>
                <span className="mpf-step-label">
                  <em>Step {index + 1}</em>
                  {step.label}
                </span>
              </button>
            ))}
          </nav>
        )}

        <div className="mpf-rail-footer">
          <p>
            {savedVehicles.length === 0
              ? "Save your first vehicle to get started."
              : `${savedVehicles.length} vehicle${savedVehicles.length !== 1 ? "s" : ""} saved so far.`}
            {" "}Switch to Excel upload above for bulk fleet proposals.
          </p>
        </div>

      </aside>

      {/* =====================================================
          RIGHT CONTENT AREA
          ===================================================== */}

      <div className="mpf-main">

        <div className="mpf-tabs">
          <button
            type="button"
            className={`mpf-tab ${mode === "manual" ? "mpf-tab-active" : ""}`}
            onClick={() => setMode("manual")}
          >
            <FaEdit />
            Fill Manually
          </button>

          <button
            type="button"
            className={`mpf-tab ${mode === "excel" ? "mpf-tab-active" : ""}`}
            onClick={() => setMode("excel")}
          >
            <FaFileExcel />
            Upload Excel
          </button>
        </div>

        <div className="mpf-content">

          {editingProposalId == null && (
            <div className="mpf-card mpf-applicant-name">
              <label htmlFor="mpf-applicant-full-name">
                Applicant Full Name
                <span className="mpf-required">*</span>
              </label>
              <p className="mpf-applicant-name-hint">
                Name of the person this policy is for. Submitting on behalf of
                someone else (family member, client)? Enter their name here —
                it doesn't have to match your account.
              </p>
              <input
                id="mpf-applicant-full-name"
                type="text"
                value={applicantFullName}
                onChange={(e) => setApplicantFullName(e.target.value)}
                onBlur={() => setApplicantNameTouched(true)}
                placeholder="Enter applicant's full name"
              />
              {applicantNameTouched && !applicantFullName.trim() && (
                <span className="mpf-field-error">Full name is required.</span>
              )}
            </div>
          )}

          {mode === "excel" && (
            <div className="mpf-card mpf-excel-card">
              <ExcelUploadPanel onImport={handleExcelImport} />
            </div>
          )}

          {mode === "manual" && (
            <>

              {savedVehicles.length > 0 && (
                <section className="mpf-saved-section">
                  <div className="mpf-saved-heading">
                    <div className="mpf-saved-heading-left">
                      <FaCheckCircle />
                      <h2>Saved Vehicles</h2>
                      <span className="mpf-saved-count">{savedVehicles.length}</span>
                    </div>
                  </div>

                  <div className="mpf-saved-list">
                    {savedVehicles.map((vehicle, index) => {
                      const vehicleName =
                        vehicle.make || vehicle.model
                          ? `${vehicle.make || "Vehicle"} ${vehicle.model || ""}`.trim()
                          : `Vehicle ${index + 1}`;

                      return (
                        <div className="mpf-saved-card" key={index}>
                          <div className="mpf-saved-icon">
                            <FaCarSide />
                          </div>

                          <div className="mpf-saved-info">
                            <div className="mpf-saved-title">
                              <strong>{vehicleName}</strong>
                              {vehicle.registration_number && (
                                <span className="mpf-saved-number">{vehicle.registration_number}</span>
                              )}
                            </div>

                            <div className="mpf-saved-details">
                              {vehicle.year && <span className="mpf-saved-detail">{vehicle.year}</span>}
                              {vehicle.fuel_type && (
                                <span className="mpf-saved-detail">
                                  {vehicle.fuel_type.charAt(0).toUpperCase() + vehicle.fuel_type.slice(1)}
                                </span>
                              )}
                              {vehicle.vehicle_usage && (
                                <span className="mpf-saved-detail">
                                  {vehicle.vehicle_usage.charAt(0).toUpperCase() + vehicle.vehicle_usage.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="mpf-saved-status">
                            <FaCheckCircle />
                            Saved
                          </span>

                          <div className="mpf-saved-actions">
                            <button
                              type="button"
                              className="mpf-edit-btn"
                              onClick={() => editVehicle(index)}
                              title="Edit vehicle"
                            >
                              <FaEdit />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="mpf-delete-btn"
                              onClick={() => removeSavedVehicle(index)}
                              title="Delete vehicle"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <div className="mpf-vehicle-count">
                <FaCarSide />
                <span>
                  {savedVehicles.length} vehicle{savedVehicles.length !== 1 ? "s" : ""} saved
                </span>
              </div>

              <section className="mpf-current-section">
                <div className="mpf-current-heading">
                  <div>
                    <h2>
                      {editingIndex !== null
                        ? `Edit Vehicle ${editingIndex + 1}`
                        : savedVehicles.length === 0
                        ? "Vehicle 1"
                        : `Vehicle ${savedVehicles.length + 1}`}
                    </h2>
                  </div>

                  <span className="mpf-current-badge">
                    {editingIndex !== null ? (
                      <>
                        <FaEdit />
                        Editing Vehicle
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        New Vehicle
                      </>
                    )}
                  </span>
                </div>

                {editingIndex !== null && (
                  <div className="mpf-editing-banner">
                    <span>You are editing a saved vehicle. Update the details and save your changes.</span>
                    <button type="button" className="mpf-cancel-edit-btn" onClick={cancelEdit}>
                      <FaTimes />
                      Cancel
                    </button>
                  </div>
                )}

                <div className="mpf-vehicle-list">
                  <VehicleFormBlock
                    index={editingIndex !== null ? editingIndex : savedVehicles.length}
                    vehicle={currentVehicle}
                    errors={submitAttempted ? currentErrors : {}}
                    onChange={updateCurrentVehicle}
                    onRemove={() => {
                      if (editingIndex !== null) {
                        cancelEdit();
                      } else {
                        setCurrentVehicle(emptyVehicle());
                        setCurrentErrors({});
                      }
                    }}
                    canRemove={false}
                    defaultOpen={true}
                  />
                </div>

                <button type="button" className="mpf-save-btn" onClick={saveVehicle}>
                  {editingIndex !== null ? (
                    <>
                      <FaCheckCircle />
                      Update Vehicle
                    </>
                  ) : (
                    <>
                      <FaSave />
                      Save Vehicle
                    </>
                  )}
                </button>
              </section>

            </>
          )}

        </div>

        {mode === "manual" && (
          <div className="mpf-submit-bar">
            <div className="mpf-submit-bar-inner">
              <span className="mpf-submit-hint">
                {savedVehicles.length === 0
                  ? "Save at least one vehicle to submit"
                  : `${savedVehicles.length} vehicle${savedVehicles.length !== 1 ? "s" : ""} ready to submit`}
              </span>

              <button
                className="mpf-submit-btn"
                onClick={handleSubmit}
                disabled={savedVehicles.length === 0 || submitting}
              >
                {submitting ? "Submitting…" : "Submit Proposal"}
              </button>
            </div>
          </div>
        )}

      </div>
      {/* end .mpf-main */}

    </div>
  );
}

export default MotorProposalForm;