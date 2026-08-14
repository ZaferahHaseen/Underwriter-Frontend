import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaCarSide,
  FaCoins,
  FaEnvelope,
  FaGasPump,
  FaPlus,
  FaShieldAlt,
  FaUserAlt,
} from "react-icons/fa";
import "./ClientMotorPolicy.css";
import { getMockMotorData } from "../../data/mockMotorPolicies";
import PageHeader from "../../components/PageHeader";

function statusTone(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("active")) return "tone-active";
  if (s.includes("pending")) return "tone-pending";
  if (s.includes("expired") || s.includes("lapsed")) return "tone-expired";

  return "tone-pending";
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

/*
  Temporary dummy data.
  This can be removed once the backend API is connected.
*/
const dummyClient = {
  full_name: "Rahul Kumar",
  email: "rahul.kumar@gmail.com",
};

const dummyVehicles = [
  {
    id: "MTR-001",
    policy_number: "MTR/2026/000184",
    make: "Hyundai",
    model: "Creta",
    year: 2024,
    registration_number: "TN 38 AB 4521",
    vehicle_type: "suv",
    fuel_type: "petrol",
    idv: 1450000,
    premium: 28750,
    issue_date: "12 Aug 2026",
    expiry_date: "11 Aug 2027",
    status: "Active",

    // Underwriting details as originally submitted — shown when the
    // client clicks "View" and lands back on the proposal form.
    engine_cc: 1500,
    vehicle_value: 1450000,
    color: "white",
    safety_features: "yes",
    anti_theft: "yes",
    driver_age: 34,
    driving_experience: 12,
    license_age: 12,
    previous_accidents: 0,
    previous_claims: 0,
    traffic_violations: 0,
    usage_type: "private",
    annual_mileage: 14000,
    city: "Chennai",
    region: "Tamil Nadu",
    previous_insurance: "yes",
    policy_lapses: 0,
  },
  {
    id: "MTR-002",
    policy_number: "MTR/2026/000185",
    make: "Honda",
    model: "City",
    year: 2023,
    registration_number: "TN 37 CD 7812",
    vehicle_type: "sedan",
    fuel_type: "petrol",
    idv: 980000,
    premium: 22400,
    issue_date: "10 Aug 2026",
    expiry_date: "09 Aug 2027",
    status: "Active",

    engine_cc: 1200,
    vehicle_value: 980000,
    color: "grey",
    safety_features: "yes",
    anti_theft: "no",
    driver_age: 29,
    driving_experience: 7,
    license_age: 7,
    previous_accidents: 0,
    previous_claims: 1,
    traffic_violations: 1,
    usage_type: "private",
    annual_mileage: 11000,
    city: "Chennai",
    region: "Tamil Nadu",
    previous_insurance: "yes",
    policy_lapses: 0,
  },
];

function ClientMotorPolicy() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = sessionStorage.getItem("client_email");

    /*
      When backend/session data is available, use it.
      Otherwise show dummy data so the UI can be developed properly.
    */
    if (email) {
      const data = getMockMotorData(email);

      if (data?.client && data?.vehicles?.length > 0) {
        setClient(data.client);
        setVehicles(data.vehicles);
      } else {
        setClient(dummyClient);
        setVehicles(dummyVehicles);
      }
    } else {
      setClient(dummyClient);
      setVehicles(dummyVehicles);
    }

    setLoading(false);
  }, []);

  const handleViewVehicle = (vehicle) => {
    sessionStorage.setItem(
      "editing_client_vehicle",
      JSON.stringify(vehicle)
    );

    navigate("/client/motor/proposal?edit=true");
  };

  const totalPolicies = vehicles.length;

  const activePolicies = vehicles.filter(
    (vehicle) => vehicle.status?.toLowerCase() === "active"
  ).length;

  const totalPremium = vehicles.reduce(
    (total, vehicle) => total + Number(vehicle.premium || 0),
    0
  );

  const totalIDV = vehicles.reduce(
    (total, vehicle) => total + Number(vehicle.idv || 0),
    0
  );

  if (loading) {
    return (
      <div className="cm-page cm-center">
        <p className="cm-loading">Loading your vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="cm-page">

      {/* =========================================================
          COMPACT HEADER
      ========================================================= */}
      <PageHeader
        theme="motor"
        title="Welcome back"
        subtitle="Manage your vehicle insurance policies and coverage"
        backTo="/client/home"
        homeTo="/client/home"
        actions={
          <button
            className="ph-header-btn"
            onClick={() => navigate("/client/motor/proposal")}
          >
            <FaPlus />
            <span>Proposal Application</span>
          </button>
        }
      />


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="cm-body">

        {/* =====================================================
            PAGE INTRODUCTION
        ===================================================== */}
        <section className="cm-page-intro">
          <div>
            <span className="cm-section-label">Motor Insurance</span>

            <h2>
              Your Vehicle Policies
            </h2>

            <p>
              View your active vehicle insurance policies, coverage
              details and policy information in one place.
            </p>
          </div>

          <div className="cm-client-info">
            <div className="cm-client-avatar">
              {client?.full_name
                ?.split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "RK"}
            </div>

            <div>
              <span>Policyholder</span>
              <strong>{client?.full_name || "Rahul Kumar"}</strong>
            </div>
          </div>
        </section>


        {/* =====================================================
            SUMMARY STATISTICS
        ===================================================== */}
        <section className="cm-summary-grid">

          <div className="cm-summary-card">
            <div className="cm-summary-icon">
              <FaShieldAlt />
            </div>

            <div>
              <span>Total Policies</span>
              <strong>{totalPolicies}</strong>
              <small>Vehicle policies</small>
            </div>
          </div>


          <div className="cm-summary-card">
            <div className="cm-summary-icon cm-icon-green">
              <FaCarSide />
            </div>

            <div>
              <span>Active Policies</span>
              <strong>{activePolicies}</strong>
              <small>Currently covered</small>
            </div>
          </div>


          <div className="cm-summary-card">
            <div className="cm-summary-icon cm-icon-gold">
              <FaCoins />
            </div>

            <div>
              <span>Total Premium</span>
              <strong>{formatMoney(totalPremium)}</strong>
              <small>Across all policies</small>
            </div>
          </div>


          <div className="cm-summary-card">
            <div className="cm-summary-icon cm-icon-blue">
              <FaShieldAlt />
            </div>

            <div>
              <span>Total IDV</span>
              <strong>{formatMoney(totalIDV)}</strong>
              <small>Total insured value</small>
            </div>
          </div>

        </section>


        {/* =====================================================
            POLICY TABLE
        ===================================================== */}
        <section className="cm-card cm-policy-table-card">

          <div className="cm-card-heading">
            <div>
              <span className="cm-section-label">
                Insurance Portfolio
              </span>

              <h3>Vehicle Policies</h3>

              <p>
                All vehicle policies associated with your account.
              </p>
            </div>

            <span className="cm-policy-count">
              {vehicles.length} {vehicles.length === 1 ? "Policy" : "Policies"}
            </span>
          </div>


          <div className="cm-table-wrapper">

            <table className="cm-policy-table">

              <thead>
                <tr>
                  <th>Policy Number</th>
                  <th>Vehicle</th>
                  <th>Registration No.</th>
                  <th>Policy Period</th>
                  <th>Premium</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {vehicles.map((vehicle) => (

                  <tr key={vehicle.id}>

                    <td>
                      <span className="cm-policy-number">
                        {vehicle.policy_number}
                      </span>
                    </td>


                    <td>
                      <div className="cm-vehicle-cell">

                        <div className="cm-vehicle-icon">
                          <FaCarSide />
                        </div>

                        <div>
                          <strong>
                            {vehicle.make} {vehicle.model}
                          </strong>

                          <span>
                            {vehicle.year} • <span style={{ textTransform: "capitalize" }}>{vehicle.vehicle_type}</span>
                          </span>
                        </div>

                      </div>
                    </td>


                    <td>
                      <span className="cm-registration">
                        {vehicle.registration_number || "—"}
                      </span>
                    </td>


                    <td>
                      <div className="cm-date-cell">
                        <span>{vehicle.issue_date || "—"}</span>
                        <small>
                          to {vehicle.expiry_date || "—"}
                        </small>
                      </div>
                    </td>


                    <td>
                      <strong className="cm-premium">
                        {formatMoney(vehicle.premium)}
                      </strong>
                    </td>


                    <td>
                      <span
                        className={`cm-status-pill ${statusTone(
                          vehicle.status
                        )}`}
                      >
                        <span className="cm-status-dot"></span>
                        {vehicle.status}
                      </span>
                    </td>


                    <td>
                      <button
                        className="cm-view-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleViewVehicle(vehicle);
                        }}
                      >
                        View
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            CONTACT / ACTION AREA
        ===================================================== */}
        <section className="cm-bottom-action">

          <div>
            <FaEnvelope />

            <div>
              <strong>Need to update your vehicle policy?</strong>
              <span>
                Submit a new proposal or contact your insurance team
                for assistance.
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/client/motor/proposal")}
          >
            <FaPlus />
            New Proposal
          </button>

        </section>

      </main>

    </div>
  );
}

export default ClientMotorPolicy;