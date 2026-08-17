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
  FaHeart,
  FaMoneyBillWave,
} from "react-icons/fa";

import "./ClientPolicyDetails.css";
import PageHeader from "../../components/PageHeader";

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

    return "—";
  };

  const fullName = getValue(
    details.full_name,
    details.fullName,
    policy.full_name
  );

  const email = getValue(
    details.email,
    policy.email
  );

  const phone = getValue(
    details.phone,
    details.phone_number,
    policy.phone
  );

  const age = getValue(
    details.age,
    policy.age
  );

  const occupation = getValue(
    details.occupation,
    policy.occupation
  );

  const address = getValue(
    details.address,
    details.residential_address,
    policy.address
  );

  const policyNumber = getValue(
    policy.policy_number,
    policy.reference_id,
    policy.id
  );

  const insuranceType = getValue(
    policy.insurance_type,
    details.insurance_type,
    "Health Insurance"
  );

  const status = getValue(
    policy.status,
    "Pending"
  );

  const coverage = getValue(
    policy.sum_assured,
    details.sum_assured,
    details.coverage_amount
  );

  const premium = getValue(
    policy.premium,
    details.premium
  );

  const issueDate = getValue(
    policy.issue_date,
    details.issue_date
  );

  const expiryDate = getValue(
    policy.expiry_date,
    details.expiry_date
  );

  return (
    <div className="cpd-page">

      {/* TOP HEADER */}
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
            <span className="cpd-eyebrow">
              {insuranceType}
            </span>

            <h1>Proposal Details</h1>

            <p>
              Review the information submitted in your insurance proposal.
            </p>
          </div>

          <div className="cpd-policy-status">
            <span className="cpd-status-label">
              Policy Status
            </span>

            <span className="cpd-status">
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
              value={
                coverage !== "—"
                  ? `₹${Number(coverage).toLocaleString("en-IN")}`
                  : "—"
              }
            />

            <InfoItem
              icon={<FaMoneyBillWave />}
              label="Premium"
              value={
                premium !== "—"
                  ? `₹${Number(premium).toLocaleString("en-IN")}`
                  : "—"
              }
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
            />

            <InfoItem
              icon={<FaEnvelope />}
              label="Email Address"
              value={email}
            />

            <InfoItem
              icon={<FaPhone />}
              label="Phone Number"
              value={phone}
            />

            <InfoItem
              icon={<FaCalendarAlt />}
              label="Age"
              value={age}
            />

            <InfoItem
              icon={<FaBriefcase />}
              label="Occupation"
              value={occupation}
            />

            <InfoItem
              icon={<FaMapMarkerAlt />}
              label="Residential Address"
              value={address}
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
              icon={<FaHeart />}
              label="Height"
              value={
                getValue(
                  details.height,
                  details.height_cm
                ) !== "—"
                  ? `${getValue(
                      details.height,
                      details.height_cm
                    )} cm`
                  : "—"
              }
            />

            <InfoItem
              icon={<FaHeart />}
              label="Weight"
              value={
                getValue(
                  details.weight,
                  details.weight_kg
                ) !== "—"
                  ? `${getValue(
                      details.weight,
                      details.weight_kg
                    )} kg`
                  : "—"
              }
            />

            <InfoItem
              icon={<FaHeart />}
              label="Smoker"
              value={getValue(
                details.smoker,
                details.smoking
              )}
            />

            <InfoItem
              icon={<FaHeart />}
              label="Alcohol Consumption"
              value={getValue(
                details.alcohol,
                details.alcohol_consumption
              )}
            />

            <InfoItem
              icon={<FaHeart />}
              label="Pre-existing Disease"
              value={getValue(
                details.preExistingDisease,
                details.pre_existing_disease
              )}
            />

            <InfoItem
              icon={<FaHeart />}
              label="Family Medical History"
              value={getValue(
                details.familyHistory,
                details.family_medical_history
              )}
            />

          </div>

        </section>


        {/* EDIT AREA */}
        <div className="cpd-bottom-actions">

          <button
            className="cpd-secondary-btn"
            onClick={() => navigate("/client/policy")}
          >
            <FaArrowLeft />
            Back to Policies
          </button>

          <button
            className="cpd-primary-btn"
            onClick={handleEdit}
          >
            <FaEdit />
            Edit Proposal
          </button>

        </div>

      </main>
    </div>
  );
}


/* Reusable information item */

function InfoItem({ icon, label, value }) {
  return (
    <div className="cpd-info-item">

      <div className="cpd-info-icon">
        {icon}
      </div>

      <div className="cpd-info-content">

        <span className="cpd-info-label">
          {label}
        </span>

        <strong className="cpd-info-value">
          {value}
        </strong>

      </div>

    </div>
  );
}

export default ClientPolicyDetails;