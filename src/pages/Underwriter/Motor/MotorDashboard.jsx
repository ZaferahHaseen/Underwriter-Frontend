import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaCarSide, FaSearch, FaChevronRight, FaBolt } from "react-icons/fa";
import "./MotorDashboard.css";
import { getMotorProposalList } from "../../../api/motorAdapter";
import PageHeader from "../../../components/PageHeader";

// WIRED TO BACKEND: GET /api/v1/vehicle/proposals via api/motorAdapter.js
// (grouped by fleet_group_id).
function MotorDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getMotorProposalList()
      .then(setProposals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = proposals.length;
  const totalVehicles = proposals.reduce((sum, p) => sum + p.vehicles.length, 0);
  const pending = proposals.filter((p) => p.status === "PENDING").length;
  const approved = proposals.filter((p) => p.status === "APPROVED").length;

  const filtered = proposals.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      p.fleet_type?.toLowerCase().includes(query.toLowerCase()) ||
      String(p.id).includes(query)
  );

  const stats = [
    { label: "Total Proposals", value: total, icon: <FaClipboardList />, tone: "motor" },
    { label: "Vehicles Insured", value: totalVehicles, icon: <FaCarSide />, tone: "gold" },
    { label: "Pending Review", value: pending, icon: <FaHourglassHalf />, tone: "gold" },
    { label: "Approved", value: approved, icon: <FaCheckCircle />, tone: "low" },
  ];

  return (
    <div className="mdash-page">
      <PageHeader
        theme="motor"
        title="Motor Insurance Dashboard"
        subtitle="Review incoming vehicle & fleet proposals and issue decisions."
        backTo="/underwriter/home"
        homeTo="/underwriter/home"
        actions={
          <button
            className="ph-header-btn"
            onClick={() => navigate("/risk-analysis/new?type=motor")}
          >
            <FaBolt /> Quick Risk Check
          </button>
        }
      />

      <div className="mdash-cards">
        {stats.map((s) => (
          <div
            className={`mdash-stat-card${s.value === 0 ? " is-empty" : ""}`}
            key={s.label}
          >
            <div className={`mdash-stat-icon mdash-stat-icon-${s.tone}`}>{s.icon}</div>
            <div>
              <h2 className="mono">{s.value}</h2>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mdash-list-panel">
        <div className="mdash-table-panel-header">
          <h2>All Motor Proposals</h2>
          <div className="mdash-search-box">
            <FaSearch />
            <input
              placeholder="Search by owner, fleet type, or policy #"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="state-text">Loading proposals…</p>}
        {error && <p className="state-text error-text">Error: {error}</p>}

        {!loading && !error && (
          <div className="mdash-list-scroll">
            {/* Column headings for the card list below */}
            <div className="mdash-row mdash-row-head">
              <span className="mdash-col mdash-col-policy">Policy Number</span>
              <span className="mdash-col mdash-col-holder">Policyholder</span>
              <span className="mdash-col mdash-col-vehicles">Vehicles</span>
              <span className="mdash-col mdash-col-status">Status</span>
              <span className="mdash-col mdash-col-action"></span>
            </div>

            {filtered.length === 0 ? (
              <p className="empty-row">No proposals match your search.</p>
            ) : (
              filtered.map((p) => (
                <div
                  className="mdash-row"
                  key={p.id}
                  onClick={() => navigate("/motor-proposal/" + p.id)}
                >
                  <span className="mdash-col mdash-col-policy mono">MTR-{String(p.id).padStart(4, "0")}</span>
                  <span className="mdash-col mdash-col-holder">
                    <span className="mdash-holder-name">{p.full_name}</span>
                    <span className="mdash-holder-type">{p.fleet_type}</span>
                  </span>
                  <span className="mdash-col mdash-col-vehicles">
                    <FaCarSide /> <span className="mono">{p.vehicles.length}</span>
                  </span>
                  <span className="mdash-col mdash-col-status">
                    <span className={`mdash-status-pill mdash-status-${p.status?.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </span>
                  <span className="mdash-col mdash-col-action">
                    <button onClick={(e) => { e.stopPropagation(); navigate("/motor-proposal/" + p.id); }}>
                      View <FaChevronRight />
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MotorDashboard;