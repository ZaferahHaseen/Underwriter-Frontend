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
        {proposal?.documents?.map((doc) => (
          <div className="dv-row" key={doc.name}>
            <div className="dv-row-left">
              <span className="dv-file-icon"><FaFileAlt /></span>
              <span>{doc.name}</span>
            </div>
            <span className={`dv-status dv-status-${doc.status.toLowerCase()}`}>
              {STATUS_ICON[doc.status]}
              {doc.status}
            </span>
          </div>
        ))}

        <p className="dv-note">
          This is placeholder data. Connect this page to <code>validateCertificate()</code> in{" "}
          <code>underwritingApi.js</code> to upload and verify real client documents.
        </p>
      </div>
    </div>
  );
}

export default DocumentVerification;
