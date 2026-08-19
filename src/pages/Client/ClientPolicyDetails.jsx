import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaShieldAlt,
  FaArrowLeft,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaIdCard,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPhone,
  FaMoneyBillWave,
  FaBirthdayCake,
  FaRulerVertical,
  FaWeight,
  FaSmoking,
  FaWineGlassAlt,
  FaNotesMedical,
  FaUsers,
} from "react-icons/fa";

import "./ClientPolicyDetails.css";
import PageHeader from "../../components/PageHeader";
import { formatName, formatCurrency } from "../../utils/format";

function statusTone(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("active") || s.includes("approved")) return "cpd-tone-active";
  if (s.includes("pending") || s.includes("review")) return "cpd-tone-pending";
  if (s.includes("expired") || s.includes("lapsed") || s.includes("rejected")) return "cpd-tone-expired";

  return "cpd-tone-pending";
}

/** Capitalize a plain word/answer value: "no" -> "No", "office" -> "Office" */
function formatWord(value, fallback = "Not provided") {
  if (value === null || value === undefined || value === "") return fallback;
  const str = String(value);
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function ClientPolicyDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    const storedPolicy = sessionStorage.getItem("selected_client_policy");

    if (storedPolicy) {
      try {
        const parsed = JSON.parse(storedPolicy);
        setPolicy(parsed);
      } catch (error) {
        console.error("Unable to read policy details:", error);
      }
    }
  }, [id]);

  const handleEdit = () => {
    if (!policy) return;

    sessionStorage.setItem(
      "editing_client_policy",
      JSON.stringify(policy)
    );

    navigate("/client/dashboard?edit=true");
  };

  if (!policy) {
    return (
      <div className="cpd-page cpd-loading-page">
        <div className="cpd-loading-card">
          <h2>Policy details not found</h2>
          <p>
            We couldn't load the selected policy details.
          </p>

          <button
            className="cpd-back-btn"
            onClick={() => navigate("/client/policy")}
          >
            <FaArrowLeft />
            Back to Policies
          </button>
        </div>
      </div>
    );
  }

  /*
    These values support both:
    1. Current backend policy structure
    2. Future detailed proposal structure

    Later, when backend sends the complete proposal,
    you only need to map the backend fields here.
  */

  const details = policy.proposal_details || policy.proposal_data || policy.details || policy;

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return null;
  };

  const fullNameRaw = getValue(
    details.full_name,
    details.fullName,
    policy.full_name
  );
  const fullName = fullNameRaw ? formatName(fullNameRaw) : "Not provided";

  const email = getValue(details.email, policy.email) ?? "Not provided";

  const phone = getValue(
    details.phone,
    details.phone_number,
    policy.phone
  ) ?? "Not provided";

  const age = getValue(details.age, policy.age) ?? "Not provided";

  const occupation = formatWord(
    getValue(details.occupation, policy.occupation)
  );

  const address = getValue(
    details.address,
    details.residential_address,
    policy.address
  ) ?? "Not provided";

  const policyNumber = getValue(
    policy.policy_number,
    policy.reference_id,
    policy.id
  ) ?? "—";

  const insuranceType = getValue(
    policy.insurance_type,
    details.insurance_type,
    "Health Insurance"
  );

  const status = getValue(policy.status, "Pending");

  const coverage = getValue(
    policy.sum_assured,
    details.sum_assured,
    details.coverage_amount
  );

  const premium = getValue(policy.premium, details.premium);

  const issueDate = getValue(policy.issue_date, details.issue_date) ?? "Not set";

  const expiryDate = getValue(policy.expiry_date, details.expiry_date) ?? "Not set";

  const heightVal = getValue(details.height, details.height_cm);
  const weightVal = getValue(details.weight, details.weight_kg);

  return (
    <div className="cpd-page">

      {/* TOP HEADER — sole Edit action lives here */}
      <PageHeader
        theme="health"
        title="Proposal Details"
        subtitle={insuranceType}
        backTo="/client/policy"
        homeTo="/client/home"
        actions={
          <button className="ph-header-btn ph-header-btn-primary" onClick={handleEdit}>
            <FaEdit />
            Edit Details
          </button>
        }
      />


      {/* PAGE TITLE */}
      <main className="cpd-content">

        <div className="cpd-page-heading">

          <div>
            <p className="cpd-subline">
              Review the information submitted in your insurance proposal.
            </p>
          </div>

          <div className="cpd-policy-status">
            <span className="cpd-status-label">
              Policy Status
            </span>

            <span className={`cpd-status ${statusTone(status)}`}>
              {status}
            </span>
          </div>

        </div>


        {/* POLICY SUMMARY */}
        <section className="cpd-section">

          <div className="cpd-section-header">
            <div>
              <span className="cpd-section-number">
                01
              </span>

              <div>
                <h2>Policy Information</h2>
                <p>Basic information about this application</p>
              </div>
            </div>
          </div>

          <div className="cpd-grid">

            <InfoItem
              icon={<FaIdCard />}
              label="Policy / Reference Number"
              value={policyNumber}
            />

            <InfoItem
              icon={<FaShieldAlt />}
              label="Insurance Type"
              value={insuranceType}
            />

            <InfoItem
              icon={<FaMoneyBillWave />}
              label="Coverage Amount"
              value={formatCurrency(coverage)}
              empty={coverage === null || coverage === undefined}
            />

            <InfoItem
              icon={<FaMoneyBillWave />}
              label="Premium"
              value={formatCurrency(premium, { treatZeroAsMissing: true, fallback: "Pending calculation" })}
              empty={premium === null || premium === undefined || Number(premium) === 0}
            />

            <InfoItem
              icon={<FaCalendarAlt />}
              label="Submitted / Issued On"
              value={issueDate}
            />

            <InfoItem
              icon={<FaCalendarAlt />}
              label="Valid Until"
              value={expiryDate}
            />

          </div>

        </section>


        {/* PERSONAL DETAILS */}
        <section className="cpd-section">

          <div className="cpd-section-header">
            <div>
              <span className="cpd-section-number">
                02
              </span>

              <div>
                <h2>Personal Information</h2>
                <p>Details provided in your proposal</p>
              </div>
            </div>
          </div>

          <div className="cpd-grid">

            <InfoItem
              icon={<FaUser />}
              label="Full Name"
              value={fullName}
              empty={!fullNameRaw}
            />

            <InfoItem
              icon={<FaEnvelope />}
              label="Email Address"
              value={email}
              empty={email === "Not provided"}
            />

            <InfoItem
              icon={<FaPhone />}
              label="Phone Number"
              value={phone}
              empty={phone === "Not provided"}
            />

            <InfoItem
              icon={<FaBirthdayCake />}
              label="Age"
              value={age}
              empty={age === "Not provided"}
            />

            <InfoItem
              icon={<FaBriefcase />}
              label="Occupation"
              value={occupation}
              empty={occupation === "Not provided"}
            />

            <InfoItem
              icon={<FaMapMarkerAlt />}
              label="Residential Address"
              value={address}
              empty={address === "Not provided"}
            />

          </div>

        </section>


        {/* HEALTH DETAILS */}
        <section className="cpd-section">

          <div className="cpd-section-header">
            <div>
              <span className="cpd-section-number">
                03
              </span>

              <div>
                <h2>Health & Medical Information</h2>
                <p>Information submitted for underwriting</p>
              </div>
            </div>
          </div>

          <div className="cpd-grid">

            <InfoItem
              icon={<FaRulerVertical />}
              label="Height"
              value={heightVal !== null ? `${heightVal} cm` : "Not provided"}
              empty={heightVal === null}
            />

            <InfoItem
              icon={<FaWeight />}
              label="Weight"
              value={weightVal !== null ? `${weightVal} kg` : "Not provided"}
              empty={weightVal === null}
            />

            <InfoItem
              icon={<FaSmoking />}
              label="Smoker"
              value={formatWord(getValue(details.smoker, details.smoking))}
            />

            <InfoItem
              icon={<FaWineGlassAlt />}
              label="Alcohol Consumption"
              value={formatWord(getValue(details.alcohol, details.alcohol_consumption))}
            />

            <InfoItem
              icon={<FaNotesMedical />}
              label="Pre-existing Disease"
              value={formatWord(getValue(details.preExistingDisease, details.pre_existing_disease))}
            />

            <InfoItem
              icon={<FaUsers />}
              label="Family Medical History"
              value={formatWord(getValue(details.familyHistory, details.family_medical_history))}
            />

          </div>

        </section>


        {/* BOTTOM ACTION — single "back" action only; Edit lives in the header,
            avoiding two differently-styled buttons for the same action. */}
        <div className="cpd-bottom-actions">

          <button
            className="cpd-secondary-btn"
            onClick={() => navigate("/client/policy")}
          >
            <FaArrowLeft />
            Back to Policies
          </button>

        </div>

      </main>
    </div>
  );
}


/* Reusable information item */

function InfoItem({ icon, label, value, empty = false }) {
  return (
    <div className="cpd-info-item">

      <div className="cpd-info-icon">
        {icon}
      </div>

      <div className="cpd-info-content">

        <span className="cpd-info-label">
          {label}
        </span>

        <strong className={`cpd-info-value${empty ? " cpd-info-value-empty" : ""}`}>
          {value}
        </strong>

      </div>

    </div>
  );
}

export default ClientPolicyDetails;