import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UnderwriterDashboard.css";
import { listProposals } from "../../api/underwritingApi";

function UnderwriterDashboard(){

  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return(

    <div className="dashboard">

      <h1>Underwriter Dashboard</h1>

      <div className="cards">

        <div>
          <h2>{total}</h2>
          <p>Total Proposals</p>
        </div>

        <div>
          <h2>{pending}</h2>
          <p>Pending Review</p>
        </div>

        <div>
          <h2>{approved}</h2>
          <p>Approved</p>
        </div>

        <div>
          <h2>{rejected}</h2>
          <p>Rejected</p>
        </div>

      </div>

      <h2>All Proposals</h2>

      {loading && <p>Loading proposals...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <table>

          <thead>
            <tr>
              <th>Client</th>
              <th>Policy</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {proposals.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name}</td>
                <td>{p.insurance_type}</td>
                <td>{p.status}</td>
                <td>
                  <button onClick={() => navigate("/proposal/" + p.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}

    </div>

  )

}

export default UnderwriterDashboard;    