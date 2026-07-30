import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import "./DocumentVerification.css";
import { getProposal } from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";

// Same dummy-data pattern as ProposalDashboard.jsx — swap this out once the
// backend exposes a real document-verification endpoint.
const USE_DUMMY_DATA = false;

const STATUS_ICON = {
  PENDING: <FaClock />,
  VERIFIED: <FaCheckCircle />,
  REJECTED: <FaTimesCircle />,
};

function DocumentVerification() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setProposal(getDummyProposal(id));
      return;
    }
    getProposal(id).then(setProposal).catch((err) => console.error(err));
  }, [id]);

  return (
    <div className="dv-page">
      <div className="dv-header">
        <BackButton to={`/proposal/${id}`} />
        <div className="dv-header-text">
          <h1>Document Verification</h1>
          <p className="dv-subhead">
            {proposal ? `${proposal.full_name} · Reference #${proposal.id}` : "Loading…"}
          </p>
        </div>
      </div>

      <div className="dv-panel">
        {!proposal?.document_filename && <p>No document attached.</p>}

        {proposal?.document_filename && (
          <>
            <div className="dv-row">
              <div className="dv-row-left">
                <span className="dv-file-icon"><FaFileAlt /></span>
                <span>{proposal.document_filename}</span>
              </div>
            </div>

            <h4>Extracted Details</h4>
            <ul>
              <li><b>Document Type:</b> {proposal.extracted_fields?.document_type || "Unknown"}</li>
              <li><b>Name:</b> {proposal.extracted_fields?.name || "—"}</li>
              <li><b>DOB:</b> {proposal.extracted_fields?.dob || "—"}</li>
              <li><b>ID Number:</b> {proposal.extracted_fields?.id_number || "—"}</li>
            </ul>

            <h4>Validation vs Form</h4>
            <ul>
              {(proposal.validation_results || []).map((v, i) => (
                <li key={i} className={v.valid ? "dv-status-verified" : "dv-status-rejected"}>
                  {v.field}: {v.valid ? "✓ Match" : `✗ Mismatch — ${v.reason}`}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentVerification;
