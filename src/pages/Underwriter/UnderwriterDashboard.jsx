import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import "./UnderwriterDashboard.css";
import { listProposals } from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";

function UnderwriterDashboard() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listProposals()
      .then(setProposals)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const total = proposals.length;
  const pending = proposals.filter((p) => p.status === "PENDING").length;
  const approved = proposals.filter((p) => p.status === "APPROVED").length;
  const rejected = proposals.filter((p) => p.status === "REJECTED").length;

  const filtered = proposals.filter((p) =>
    p.full_name?.toLowerCase().includes(query.toLowerCase()) ||
    p.insurance_type?.toLowerCase().includes(query.toLowerCase())
  );

  const stats = [
    { label: "Total Proposals", value: total, icon: <FaClipboardList />, tone: "signal" },
    { label: "Pending Review", value: pending, icon: <FaHourglassHalf />, tone: "gold" },
    { label: "Approved", value: approved, icon: <FaCheckCircle />, tone: "low" },
    { label: "Rejected", value: rejected, icon: <FaTimesCircle />, tone: "high" },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <BackButton to="/" />
        <div className="dashboard-header-text">
          <h1>Underwriter Dashboard</h1>
          <p className="dashboard-subhead">Review incoming proposals and issue decisions.</p>
        </div>
        <button className="quick-check-btn" onClick={() => navigate("/risk-analysis/new")}>
          Quick Risk Check
        </button>
      </div>

      <div className="cards">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon stat-icon-${s.tone}`}>{s.icon}</div>
            <div>
              <h2 className="mono">{s.value}</h2>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="table-panel">
        <div className="table-panel-header">
          <h2>All Proposals</h2>
          <div className="search-box">
            <FaSearch />
            <input
              placeholder="Search by client or policy type"
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
                <th>Client</th>
                <th>Policy</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-row">No proposals match your search.</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.full_name}</td>
                    <td>{p.insurance_type}</td>
                    <td>
                      <span className={`status-pill status-${p.status?.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button onClick={() => navigate("/proposal/" + p.id)}>View</button>
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

export default UnderwriterDashboard;
