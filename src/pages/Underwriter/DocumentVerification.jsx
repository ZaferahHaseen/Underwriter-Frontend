import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaFileAlt, FaCheck, FaTimes } from "react-icons/fa";
import "./DocumentVerification.css";
import { getProposal } from "../../api/underwritingApi";
import BackButton from "../../components/BackButton";

function DocumentVerification() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProposal(id)
      .then(setProposal)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="dv-page">
        <div className="dv-header">
          <BackButton to={`/proposal/${id}`} />
          <div className="dv-header-text">
            <h1>Document Verification</h1>
            <p className="dv-subhead">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const checks = proposal?.validation_results || [];
  const hasDoc = !!proposal?.document_filename;
  const failedCount = checks.filter((c) => !c.valid).length;
  const allPassed = hasDoc && checks.length > 0 && failedCount === 0;
  const hasFailure = failedCount > 0;

  const stage = !hasDoc ? 1 : checks.length === 0 ? 2 : 3;

  let statusWord = "PENDING";
  let statusNote = "Upload a document to begin verification.";
  let statusTone = "pending";

  if (hasDoc && checks.length === 0) {
    statusWord = "UNVERIFIED";
    statusNote = "Document uploaded, but no comparable fields were found — check the scan quality.";
    statusTone = "pending";
  } else if (allPassed) {
    statusWord = "VERIFIED";
    statusNote = "All submitted details match the document. Safe to proceed with underwriting.";
    statusTone = "verified";
  } else if (hasFailure) {
    statusWord = "NEEDS REVIEW";
    statusNote = `${failedCount} of ${checks.length} check${checks.length > 1 ? "s" : ""} failed — confirm details with the client before approving.`;
    statusTone = "review";
  }

  return (
    <div className="dv-page">
      <div className="dv-header">
        <BackButton to={`/proposal/${id}`} />
        <div className="dv-header-text">
          <h1>Document Verification</h1>
          <p className="dv-subhead">Cross-checking the uploaded ID against the submitted proposal.</p>
        </div>
      </div>

      <div className="dv-card">
        <div className="dv-chain">
          <div className={`dv-chain-dot ${stage >= 1 ? "dv-chain-active" : ""}`} />
          <div className={`dv-chain-line ${stage >= 2 ? "dv-chain-active" : ""}`} />
          <div className={`dv-chain-dot ${stage >= 2 ? "dv-chain-active" : ""}`} />
          <div className={`dv-chain-line ${stage >= 3 ? "dv-chain-active" : ""}`} />
          <div className={`dv-chain-dot dv-chain-dot-${statusTone} ${stage >= 3 ? "dv-chain-active" : ""}`} />
        </div>

        <div className="dv-body">
          <section className="dv-section">
            <span className="dv-eyebrow">Upload</span>
            {hasDoc ? (
              <div className="dv-doc-row">
                <span className="dv-file-icon"><FaFileAlt /></span>
                <div>
                  <p className="dv-doc-name mono">{proposal.document_filename}</p>
                  <p className="dv-doc-status">Scanned and parsed</p>
                </div>
              </div>
            ) : (
              <p className="dv-empty">No document attached to this proposal.</p>
            )}
          </section>

          <div className="dv-divider" />

          <section className="dv-section">
            <span className="dv-eyebrow">Verify</span>
            {checks.length === 0 ? (
              <p className="dv-empty">No comparable fields extracted from the document.</p>
            ) : (
              <ul className="dv-check-list">
                {checks.map((c, i) => (
                  <li key={i} className={c.valid ? "dv-check dv-check-pass" : "dv-check dv-check-fail"}>
                    <span className="dv-check-icon">{c.valid ? <FaCheck /> : <FaTimes />}</span>
                    <div>
                      <p className="dv-check-field">{c.field.charAt(0).toUpperCase() + c.field.slice(1)}</p>
                      <p className="dv-check-detail">
                        {c.valid ? "Matches the submitted proposal." : c.reason}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="dv-divider" />

          <section className="dv-section">
            <span className="dv-eyebrow">Decide</span>
            <p className={`dv-status-word dv-status-${statusTone}`}>{statusWord}</p>
            <p className="dv-status-note">{statusNote}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DocumentVerification;