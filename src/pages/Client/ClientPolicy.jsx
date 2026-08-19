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
import { formatName, formatCurrency } from "../../utils/format";

// WIRED TO BACKEND: GET /api/v1/client/my-policies (JWT-identified, see
// app/client_router.py). No dummy fallback — an unauthenticated visit is
// bounced by ProtectedRoute before this page ever renders, and zero
// policies just shows the real empty state below.

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

function ClientPolicy() {
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      setPolicies(data.policies || []);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const handleView = async (policy) => {
  /*
   * View -> read-only details page (ClientPolicyDetails.jsx @ /client/policy/:id).
   * That page reads sessionStorage["selected_client_policy"]. my-policies
   * only returns summary fields, so for real (numeric-id) proposals we
   * fetch the full detail first — the dummy fallback rows already carry
   * their full proposal_details inline.
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
    "selected_client_policy",
    JSON.stringify(toStore)
  );

  navigate(`/client/policy/${policy.id}`);
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

  const rawName = formatName(client?.full_name);
  const clientName = rawName !== "—" ? rawName : "Policyholder";

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
              Track application status and coverage details in one place.
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
                .toUpperCase() || "?"}
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
                <div className={`cp-summary-icon cp-icon-green${activePolicies === 0 ? " cp-icon-muted" : ""}`}>
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
                  <strong>
                    {formatCurrency(totalPremium, { treatZeroAsMissing: true, fallback: "Pending" })}
                  </strong>
                  <small>Across all policies</small>
                </div>
              </div>


              <div className="cp-summary-card">
                <div className="cp-summary-icon cp-icon-blue">
                  <FaShieldAlt />
                </div>

                <div>
                  <span>Total Sum Assured</span>
                  <strong>{formatCurrency(totalSumAssured)}</strong>
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
                            {formatCurrency(policy.sum_assured)}
                          </strong>
                        </td>


                        <td>
                          <strong className="cp-premium">
                            {formatCurrency(policy.premium, { treatZeroAsMissing: true, fallback: "Pending" })}
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