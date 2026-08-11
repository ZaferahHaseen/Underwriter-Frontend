import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSearch, FaCarSide } from "react-icons/fa";
import "./MotorDashboard.css";
import { listVehicleProposals } from "../../../api/underwritingApi";
import BackButton from "../../../components/BackButton";

// Real backend wired -- one row = one proposal = one vehicle (flat),
// NOT fleet-grouped like the old dummy data assumed.
const USE_DUMMY_DATA = false;

function MotorDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setLoading(false);
      return;
    }
    listVehicleProposals()
      .then((data) => {
        setProposals(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const total = proposals.length;
  const pending = proposals.filter((p) => p.status === "PENDING").length;
  const approved = proposals.filter((p) => p.status === "APPROVED").length;
  const rejected = proposals.filter((p) => p.status === "REJECTED").length;

  const filtered = proposals.filter((p) =>
    p.full_name?.toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: "Total Proposals", value: total, icon: <FaClipboardList />, tone: "motor" },
    { label: "Pending Review", value: pending, icon: <FaHourglassHalf />, tone: "gold" },
    { label: "Approved", value: approved, icon: <FaCheckCircle />, tone: "low" },
    { label: "Rejected", value: rejected, icon: <FaTimesCircle />, tone: "high" },
  ];

  return (
    <div className="mdash-page">
      <div className="mdash-header">
        <BackButton to="/underwriter/home" />
        <div className="mdash-header-text">
          <h1>Motor Insurance Dashboard</h1>
          <p className="mdash-subhead">Review incoming vehicle proposals and issue decisions.</p>
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
              placeholder="Search by policyholder name"
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
                <th>Vehicle</th>
                <th>Created</th>
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
                    <td className="mono">#{p.vehicle_id}</td>
                    <td>{p.created_at}</td>
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