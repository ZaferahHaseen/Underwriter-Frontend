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
import { getMyVehiclePolicies, getVehicleProposal, isLoggedIn } from "../../api/underwritingApi";
import PageHeader from "../../components/PageHeader";

// WIRED TO BACKEND: GET /api/v1/client/my-vehicle-policies (JWT-identified,
// see app/client_router.py). No dummy fallback — ProtectedRoute already
// blocks unauthenticated access, and zero vehicles just shows an empty table.

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

function ClientMotorPolicy() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyVehiclePolicies()
      .then((data) => {
        setClient(data.client || null);
        setVehicles(data.vehicles || []);
      })
      .catch((err) => setError(err.message || "Couldn't load your vehicle policies."))
      .finally(() => setLoading(false));
  }, []);

  const handleViewVehicle = async (vehicle) => {
    // Real rows only carry summary fields (make/model/idv/etc) — pull the
    // full raw_input from the vehicle proposal so the edit form is
    // properly prefilled.
    let toStore = vehicle;

    if (typeof vehicle.id === "number" && isLoggedIn()) {
      try {
        const full = await getVehicleProposal(vehicle.id);
        toStore = { ...full.raw_input, id: full.id, registration_number: vehicle.registration_number };
      } catch {
        // fall back to the summary row if the detail fetch fails
      }
    }

    sessionStorage.setItem(
      "editing_client_vehicle",
      JSON.stringify(toStore)
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

  if (error) {
    return (
      <div className="cm-page cm-center">
        <p className="cm-loading">Error: {error}</p>
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
                .toUpperCase() || "?"}
            </div>

            <div>
              <span>Policyholder</span>
              <strong>{client?.full_name || "Policyholder"}</strong>
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