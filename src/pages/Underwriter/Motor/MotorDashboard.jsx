import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSearch, FaCarSide } from "react-icons/fa";
import "./MotorDashboard.css";
import { getDummyMotorProposalList } from "../../../api/dummyMotorProposals";
import BackButton from "../../../components/BackButton";

// Flip to false once the backend teammate's motor list endpoint is live.
const USE_DUMMY_DATA = true;

function MotorDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setProposals(getDummyMotorProposalList());
      setLoading(false);
      return;
    }
    // Real endpoint wiring goes here once ready, e.g. listMotorProposals().
    setLoading(false);
  }, []);

  const total = proposals.length;
  const totalVehicles = proposals.reduce((sum, p) => sum + p.vehicles.length, 0);
  const pending = proposals.filter((p) => p.status === "PENDING").length;
  const approved = proposals.filter((p) => p.status === "APPROVED").length;
  const rejected = proposals.filter((p) => p.status === "REJECTED").length;

  const filtered = proposals.filter(
    (p) =>
      p.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      p.fleet_type?.toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: "Total Proposals", value: total, icon: <FaClipboardList />, tone: "motor" },
    { label: "Vehicles Insured", value: totalVehicles, icon: <FaCarSide />, tone: "gold" },
    { label: "Pending Review", value: pending, icon: <FaHourglassHalf />, tone: "gold" },
    { label: "Approved", value: approved, icon: <FaCheckCircle />, tone: "low" },
  ];

  return (
    <div className="mdash-page">
      <div className="mdash-header">
        <BackButton to="/underwriter/home" />
        <div className="mdash-header-text">
          <h1>Motor Insurance Dashboard</h1>
          <p className="mdash-subhead">Review incoming vehicle & fleet proposals and issue decisions.</p>
        </div>
      </div>

      <div className="mdash-cards">
        {stats.map((s) => (
          <div className="mdash-stat-card" key={s.label}>
            <div className={`mdash-stat-icon mdash-stat-icon-${s.tone}`}>{s.icon}</div>
            <div>
              <h2 className="mono">{s.value}</h2>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mdash-table-panel">
        <div className="mdash-table-panel-header">
          <h2>All Motor Proposals</h2>
          <div className="mdash-search-box">
            <FaSearch />
            <input
              placeholder="Search by owner or fleet type"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && <p className="state-text">Loading proposals…</p>}
        {error && <p className="state-text error-text">Error: {error}</p>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Policyholder</th>
                <th>Type</th>
                <th>Vehicles</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-row">No proposals match your search.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.full_name}</td>
                    <td>{p.fleet_type}</td>
                    <td className="mono">{p.vehicles.length}</td>
                    <td>
                      <span className={`mdash-status-pill mdash-status-${p.status?.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button onClick={() => navigate("/motor-proposal/" + p.id)}>View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MotorDashboard;
