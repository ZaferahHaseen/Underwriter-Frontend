import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaShieldAlt,
  FaFileContract,
  FaHeartbeat,
  FaPlus,
  FaCoins,
  FaEnvelope,
} from "react-icons/fa";

import "./ClientPolicy.css";
import { getMyPolicies, getProposal, isLoggedIn, clearAuth } from "../../api/underwritingApi";
import PageHeader from "../../components/PageHeader";

// WIRED TO BACKEND: GET /api/v1/client/my-policies (JWT-identified, see
// app/client_router.py). Dummy fallback below only fires if nobody is
// logged in (shouldn't happen once Login.jsx is used, kept for safety).

function statusTone(status) {
  const s = (status || "").toLowerCase();

  if (s.includes("active") || s.includes("approved")) {
    return "tone-active";
  }

  if (s.includes("pending") || s.includes("review")) {
    return "tone-pending";
  }

  if (
    s.includes("expired") ||
    s.includes("lapsed") ||
    s.includes("rejected")
  ) {
    return "tone-expired";
  }

  return "tone-pending";
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function ClientPolicy() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      /*
       * No client is logged in yet — show dummy data so the
       * page (and the View -> proposal form flow) can still be
       * developed / demoed, same as the Motor policy page does.
       */
      applyData({});
      setLoading(false);
      return;
    }

    getMyPolicies()
      .then(applyData)
      .catch((err) => {
        setError(err.message || "Couldn't load your policies.");
      })
      .finally(() => {
        setLoading(false);
      });

    function applyData(data) {
      setClient(data.client || null);

      /*
       * Backend policies will eventually come here.
       *
       * For now, if backend does not return policies,
       * dummy policies are displayed so that the UI can be developed.
       */
      const backendPolicies = data.policies || [];

      if (backendPolicies.length > 0) {
        setPolicies(backendPolicies);
      } else {
        setPolicies([
          {
            id: "POL-001",

            insurance_type: "Life Insurance",
            policy_number: "LIFE-2026-00124",
            status: "Active",

            sum_assured: 1000000,
            premium: 24500,

            issue_date: "12 Aug 2026",
            expiry_date: "11 Aug 2046",

            submitted_date: "10 Aug 2026",

            /*
             * Underwriting details as originally submitted — these
             * field names/formats must match exactly what the
             * proposal form (ClientDashboard.jsx) reads, the same
             * way the Motor dummy vehicles do for MotorProposalForm.
             */
            proposal_details: {
              full_name: data.client?.full_name || "Rahul Kumar",
              email: data.client?.email || email,
              age: data.client?.age || 32,

              // "office" | "field" | "hazardous"
              occupation: "office",

              annual_income: 850000,
              sum_assured: 1000000,

              credit_score: 760,
              num_previous_claims: 0,
              years_with_insurer: 4,

              country_code: "IN",
              doc_type: "national_id",

              // Health & lifestyle
              height_cm: 175,
              weight_kg: 72,

              smoker: "no",
              alcohol_consumption: "occasional",
              pre_existing_disease: "no",
              family_medical_history: "yes",
            },
          },

          {
            id: "POL-002",

            insurance_type: "Health Insurance",
            policy_number: "HEALTH-2026-00451",
            status: "Pending",

            sum_assured: 500000,
            premium: 18500,

            issue_date: "—",
            expiry_date: "—",

            submitted_date: "11 Aug 2026",

            proposal_details: {
              full_name: data.client?.full_name || "Rahul Kumar",
              email: data.client?.email || email,
              age: data.client?.age || 32,

              occupation: "field",

              annual_income: 850000,
              sum_assured: 500000,

              credit_score: 705,
              num_previous_claims: 1,
              years_with_insurer: 1,

              country_code: "IN",
              doc_type: "national_id",

              height_cm: 168,
              weight_kg: 65,

              smoker: "no",
              alcohol_consumption: "none",
              pre_existing_disease: "yes",
              family_medical_history: "no",
            },
          },
        ]);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const handleView = async (policy) => {
    /*
     * The proposal page can read this object and automatically fill its
     * form fields. my-policies only returns summary fields, so for real
     * (numeric-id) proposals we fetch the full detail first — the dummy
     * fallback rows already carry their full proposal_details inline.
     */
    let toStore = policy;

    if (typeof policy.id === "number" && isLoggedIn()) {
      try {
        const full = await getProposal(policy.id);
        toStore = { ...policy, id: full.id, proposal_details: full };
      } catch {
        // fall back to the summary row if the detail fetch fails
      }
    }

    sessionStorage.setItem(
      "editing_client_policy",
      JSON.stringify(toStore)
    );

    navigate("/client/dashboard?edit=true");
  };

  const totalPolicies = policies.length;

  const activePolicies = policies.filter((policy) =>
    (policy.status || "").toLowerCase().includes("active")
  ).length;

  const totalPremium = policies.reduce(
    (total, policy) => total + Number(policy.premium || 0),
    0
  );

  const totalSumAssured = policies.reduce(
    (total, policy) => total + Number(policy.sum_assured || 0),
    0
  );

  if (loading) {
    return (
      <div className="cp-page cp-center">
        <p className="cp-loading">Loading your policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-page cp-center">
        <div className="cp-error-card">
          <p>{error}</p>

          <button onClick={handleLogout}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const clientName = client?.full_name || "Rahul Kumar";

  return (
    <div className="cp-page">

      {/* =========================================================
          COMPACT HEADER
      ========================================================= */}
      <PageHeader
        theme="health"
        title="Welcome back"
        subtitle="Manage your health & life insurance applications and policies"
        backTo="/client/home"
        homeTo="/client/home"
        onLogout={handleLogout}
        actions={
          <button
            className="ph-header-btn"
            onClick={() => navigate("/client/dashboard")}
          >
            <FaPlus />
            <span>New Application</span>
          </button>
        }
      />


      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="cp-body">

        {/* =====================================================
            PAGE INTRODUCTION
        ===================================================== */}
        <section className="cp-page-intro">
          <div>
            <span className="cp-section-label">Health &amp; Life Insurance</span>

            <h2>
              Your Insurance Policies
            </h2>

            <p>
              View your submitted applications, track their status and
              coverage details in one place.
            </p>
          </div>

          <div className="cp-client-info">
            <div className="cp-client-avatar">
              {clientName
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase() || "RK"}
            </div>

            <div>
              <span>Policyholder</span>
              <strong>{clientName}</strong>
            </div>
          </div>
        </section>


        {/* =====================================================
            EMPTY STATE
        ===================================================== */}
        {policies.length === 0 && (

          <div className="cp-empty">

            <div className="cp-empty-icon">
              <FaFileContract />
            </div>

            <h2>No Applications Yet</h2>

            <p>
              You haven't submitted an insurance application yet.
              Start your first application to get covered.
            </p>

            <button
              className="cp-empty-btn"
              onClick={() => navigate("/client/dashboard")}
            >
              <FaPlus />
              Start New Application
            </button>

          </div>

        )}


        {policies.length > 0 && (
          <>

            {/* =====================================================
                SUMMARY STATISTICS
            ===================================================== */}
            <section className="cp-summary-grid">

              <div className="cp-summary-card">
                <div className="cp-summary-icon">
                  <FaShieldAlt />
                </div>

                <div>
                  <span>Total Policies</span>
                  <strong>{totalPolicies}</strong>
                  <small>Insurance applications</small>
                </div>
              </div>


              <div className="cp-summary-card">
                <div className="cp-summary-icon cp-icon-green">
                  <FaHeartbeat />
                </div>

                <div>
                  <span>Active Policies</span>
                  <strong>{activePolicies}</strong>
                  <small>Currently covered</small>
                </div>
              </div>


              <div className="cp-summary-card">
                <div className="cp-summary-icon cp-icon-gold">
                  <FaCoins />
                </div>

                <div>
                  <span>Total Premium</span>
                  <strong>{formatMoney(totalPremium)}</strong>
                  <small>Across all policies</small>
                </div>
              </div>


              <div className="cp-summary-card">
                <div className="cp-summary-icon cp-icon-blue">
                  <FaShieldAlt />
                </div>

                <div>
                  <span>Total Sum Assured</span>
                  <strong>{formatMoney(totalSumAssured)}</strong>
                  <small>Total insured value</small>
                </div>
              </div>

            </section>


            {/* =====================================================
                POLICY TABLE
            ===================================================== */}
            <section className="cp-card cp-policy-table-card">

              <div className="cp-card-heading">
                <div>
                  <span className="cp-section-label">
                    Insurance Portfolio
                  </span>

                  <h3>Your Policies</h3>

                  <p>
                    All insurance applications associated with your account.
                  </p>
                </div>

                <span className="cp-policy-count">
                  {policies.length} {policies.length === 1 ? "Policy" : "Policies"}
                </span>
              </div>


              <div className="cp-table-wrapper">

                <table className="cp-policy-table">

                  <thead>
                    <tr>
                      <th>Policy Number</th>
                      <th>Insurance Type</th>
                      <th>Sum Assured</th>
                      <th>Premium</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>

                    {policies.map((policy) => (

                      <tr key={policy.id}>

                        <td>
                          <span className="cp-policy-number">
                            {policy.policy_number || policy.id}
                          </span>
                        </td>


                        <td>
                          <div className="cp-policy-cell">

                            <div className="cp-policy-icon">
                              <FaFileContract />
                            </div>

                            <div>
                              <strong>
                                {policy.insurance_type || "Health Insurance"}
                              </strong>

                              <span>
                                Insurance Proposal
                              </span>
                            </div>

                          </div>
                        </td>


                        <td>
                          <strong className="cp-table-value">
                            {formatMoney(policy.sum_assured)}
                          </strong>
                        </td>


                        <td>
                          <strong className="cp-premium">
                            {formatMoney(policy.premium)}
                          </strong>
                        </td>


                        <td>
                          <span
                            className={`cp-status-pill ${statusTone(
                              policy.status
                            )}`}
                          >
                            <span className="cp-status-dot"></span>
                            {policy.status || "Pending"}
                          </span>
                        </td>


                        <td>
                          <button
                            className="cp-view-btn"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleView(policy);
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
            <section className="cp-bottom-action">

              <div>
                <FaEnvelope />

                <div>
                  <strong>Need to update your policy?</strong>
                  <span>
                    Submit a new application or contact your insurance team
                    for assistance.
                  </span>
                </div>
              </div>

              <button
                onClick={() => navigate("/client/dashboard")}
              >
                <FaPlus />
                New Application
              </button>

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default ClientPolicy;