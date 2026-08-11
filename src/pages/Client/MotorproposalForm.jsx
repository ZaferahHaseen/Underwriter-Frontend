import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";

import BackButton from "../../components/BackButton";
import VehicleFormBlock from "../../components/VehicleFormBlock";
import ExcelUploadPanel from "../../components/ExcelUploadPanel";
import {
  emptyVehicle,
  validateVehicle,
} from "../../data/motorFormFields";

import "./MotorProposalForm.css";

function MotorProposalForm() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("manual");

  // All vehicles that have already been saved
  const [savedVehicles, setSavedVehicles] = useState([]);

  // The ONE vehicle currently being edited/filled
  const [currentVehicle, setCurrentVehicle] = useState(emptyVehicle());

  // null = creating a new vehicle
  // number = editing an already saved vehicle
  const [editingIndex, setEditingIndex] = useState(null);

  const [currentErrors, setCurrentErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  /* =========================================================
     CURRENT VEHICLE
     ========================================================= */

  const updateCurrentVehicle = (key, value) => {
    setCurrentVehicle((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Clear the error for the field as soon as user changes it
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

      firstBad?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (editingIndex !== null) {
      // UPDATE existing vehicle
      setSavedVehicles((prev) =>
        prev.map((vehicle, index) =>
          index === editingIndex
            ? { ...currentVehicle }
            : vehicle
        )
      );
    } else {
      // SAVE new vehicle
      setSavedVehicles((prev) => [
        ...prev,
        { ...currentVehicle },
      ]);
    }

    // Reset form for next vehicle
    setCurrentVehicle(emptyVehicle());
    setCurrentErrors({});
    setSubmitAttempted(false);
    setEditingIndex(null);

    // Scroll back to top of the proposal area
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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

    // Bring the current form into view
    setTimeout(() => {
      document
        .querySelector(".mpf-current-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
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
      document
        .querySelector(".mpf-current-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* =========================================================
     DELETE SAVED VEHICLE
     ========================================================= */

  const removeSavedVehicle = (index) => {
    setSavedVehicles((prev) =>
      prev.filter((_, i) => i !== index)
    );

    // If deleting the vehicle currently being edited
    if (editingIndex === index) {
      cancelEdit();
      return;
    }

    // Keep editing index correct if a vehicle before it was deleted
    if (
      editingIndex !== null &&
      index < editingIndex
    ) {
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

    setSavedVehicles((prev) => [
      ...prev,
      ...importedVehicles,
    ]);

    // Clear current form
    setCurrentVehicle(emptyVehicle());
    setCurrentErrors({});
    setSubmitAttempted(false);
    setEditingIndex(null);

    setMode("manual");

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  /* =========================================================
     FINAL SUBMISSION
     ========================================================= */

  const handleSubmit = () => {
    // There must be at least one saved vehicle
    if (savedVehicles.length === 0) {
      setSubmitAttempted(true);

      alert("Please save at least one vehicle before submitting.");
      return;
    }

    // Validate all saved vehicles again before final submission
    const allErrors = savedVehicles.map((vehicle) =>
      validateVehicle(vehicle)
    );

    const hasErrors = allErrors.some(
      (errors) => Object.keys(errors).length > 0
    );

    if (hasErrors) {
      alert(
        "One or more saved vehicles contain invalid details. Please edit and correct them before submitting."
      );
      return;
    }

    const payload = {
      vehicles: savedVehicles,
    };

    console.log(
      "Motor proposal submission payload:",
      payload
    );

    // TODO:
    // Replace this with the real backend submission call.
    setSubmitted(true);
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
            An underwriter will review the details and
            update your policy status shortly.
          </p>

          <button
            className="mpf-success-btn"
            onClick={() =>
              navigate("/client/motor")
            }
          >
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
    <div className="mpf-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mpf-header">
        <BackButton to="/client/motor" />

        <div className="mpf-header-text">
          <h1>Motor Insurance Proposal</h1>

          <p className="mpf-subhead">
            Add your vehicles one at a time, save them,
            and submit the complete proposal when you're ready.
          </p>
        </div>
      </div>

      {/* =====================================================
          MODE TABS
          ===================================================== */}

      <div className="mpf-tabs">

        <button
          type="button"
          className={`mpf-tab ${
            mode === "manual"
              ? "mpf-tab-active"
              : ""
          }`}
          onClick={() => setMode("manual")}
        >
          <FaEdit />
          Fill Manually
        </button>

        <button
          type="button"
          className={`mpf-tab ${
            mode === "excel"
              ? "mpf-tab-active"
              : ""
          }`}
          onClick={() => setMode("excel")}
        >
          <FaFileExcel />
          Upload Excel
        </button>

      </div>

      <div className="mpf-content">

        {/* ===================================================
            EXCEL MODE
            =================================================== */}

        {mode === "excel" && (
          <div className="mpf-card mpf-excel-card">
            <ExcelUploadPanel
              onImport={handleExcelImport}
            />
          </div>
        )}

        {/* ===================================================
            MANUAL MODE
            =================================================== */}

        {mode === "manual" && (
          <>

            {/* =================================================
                SAVED VEHICLES
                ================================================= */}

            {savedVehicles.length > 0 && (
              <section className="mpf-saved-section">

                <div className="mpf-saved-heading">

                  <div className="mpf-saved-heading-left">
                    <FaCheckCircle />

                    <h2>
                      Saved Vehicles
                    </h2>

                    <span className="mpf-saved-count">
                      {savedVehicles.length}
                    </span>
                  </div>

                </div>

                <div className="mpf-saved-list">

                  {savedVehicles.map(
                    (vehicle, index) => {

                      const vehicleName =
                        vehicle.make ||
                        vehicle.model
                          ? `${vehicle.make || "Vehicle"} ${
                              vehicle.model || ""
                            }`.trim()
                          : `Vehicle ${
                              index + 1
                            }`;

                      return (
                        <div
                          className="mpf-saved-card"
                          key={index}
                        >

                          {/* Vehicle icon */}
                          <div className="mpf-saved-icon">
                            <FaCarSide />
                          </div>

                          {/* Vehicle information */}
                          <div className="mpf-saved-info">

                            <div className="mpf-saved-title">

                              <strong>
                                {vehicleName}
                              </strong>

                              {vehicle.registration_number && (
                                <span className="mpf-saved-number">
                                  {
                                    vehicle.registration_number
                                  }
                                </span>
                              )}

                            </div>

                            <div className="mpf-saved-details">

                              {vehicle.year && (
                                <span className="mpf-saved-detail">
                                  {vehicle.year}
                                </span>
                              )}

                              {vehicle.fuel_type && (
                                <span className="mpf-saved-detail">
                                  {vehicle.fuel_type
                                    .charAt(0)
                                    .toUpperCase() +
                                    vehicle.fuel_type.slice(
                                      1
                                    )}
                                </span>
                              )}

                              {vehicle.vehicle_usage && (
                                <span className="mpf-saved-detail">
                                  {vehicle.vehicle_usage
                                    .charAt(0)
                                    .toUpperCase() +
                                    vehicle.vehicle_usage.slice(
                                      1
                                    )}
                                </span>
                              )}

                            </div>

                          </div>

                          {/* Saved status */}
                          <span className="mpf-saved-status">
                            <FaCheckCircle />
                            Saved
                          </span>

                          {/* Actions */}
                          <div className="mpf-saved-actions">

                            <button
                              type="button"
                              className="mpf-edit-btn"
                              onClick={() =>
                                editVehicle(index)
                              }
                              title="Edit vehicle"
                            >
                              <FaEdit />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="mpf-delete-btn"
                              onClick={() =>
                                removeSavedVehicle(
                                  index
                                )
                              }
                              title="Delete vehicle"
                            >
                              <FaTrashAlt />
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </section>
            )}

            {/* =================================================
                VEHICLE COUNT
                ================================================= */}

            <div className="mpf-vehicle-count">
              <FaCarSide />

              <span>
                {savedVehicles.length} vehicle
                {savedVehicles.length !== 1
                  ? "s"
                  : ""}{" "}
                saved
              </span>
            </div>

            {/* =================================================
                CURRENT SINGLE FORM
                ================================================= */}

            <section className="mpf-current-section">

              <div className="mpf-current-heading">

                <div>
                  <h2>
                    {editingIndex !== null
                      ? `Edit Vehicle ${
                          editingIndex + 1
                        }`
                      : savedVehicles.length === 0
                      ? "Vehicle 1"
                      : `Vehicle ${
                          savedVehicles.length + 1
                        }`}
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

              {/* Editing banner */}
              {editingIndex !== null && (
                <div className="mpf-editing-banner">

                  <span>
                    You are editing a saved vehicle.
                    Update the details and save your changes.
                  </span>

                  <button
                    type="button"
                    className="mpf-cancel-edit-btn"
                    onClick={cancelEdit}
                  >
                    <FaTimes />
                    Cancel
                  </button>

                </div>
              )}

              <div className="mpf-vehicle-list">

                <VehicleFormBlock
                  index={
                    editingIndex !== null
                      ? editingIndex
                      : savedVehicles.length
                  }
                  vehicle={currentVehicle}
                  errors={
                    submitAttempted
                      ? currentErrors
                      : {}
                  }
                  onChange={
                    updateCurrentVehicle
                  }
                  onRemove={() => {
                    if (
                      editingIndex !== null
                    ) {
                      cancelEdit();
                    } else {
                      setCurrentVehicle(
                        emptyVehicle()
                      );
                      setCurrentErrors({});
                    }
                  }}
                  canRemove={false}
                  defaultOpen={true}
                />

              </div>

              {/* Save / Update */}
              <button
                type="button"
                className="mpf-save-btn"
                onClick={saveVehicle}
              >

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

      {/* =====================================================
          STICKY SUBMIT BAR
          ===================================================== */}

      {mode === "manual" && (
        <div className="mpf-submit-bar">

          <div className="mpf-submit-bar-inner">

            <span className="mpf-submit-hint">

              {savedVehicles.length === 0
                ? "Save at least one vehicle to submit"
                : `${savedVehicles.length} vehicle${
                    savedVehicles.length !== 1
                      ? "s"
                      : ""
                  } ready to submit`}

            </span>

            <button
              className="mpf-submit-btn"
              onClick={handleSubmit}
              disabled={savedVehicles.length === 0}
            >
              Submit Proposal
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default MotorProposalForm;