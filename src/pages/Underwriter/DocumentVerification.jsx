import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaMinusCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./DocumentVerification.css";
import { getProposal, getProposalDocumentUrl } from "../../api/underwritingApi";
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


  if (loading || !proposal) {
    return (
      <div className="vp-page">
        <p className="vp-loading">Loading case…</p>
      </div>
    );
  }

  const checks = proposal.validation_results || [];
  const fields = proposal.extracted_fields || {};
  const hasDoc = !!proposal.document_filename;
  const schemaUsed = proposal.schema_used; // e.g. "IN / aadhaar"
  const failedCount = checks.filter((c) => !c.valid).length;
  const allPassed = hasDoc && checks.length > 0 && failedCount === 0;
  const hasFailure = failedCount > 0;
  const isPending = proposal.status === "PENDING";

  let decisionTone = "info";
  let decisionTitle = "Awaiting Verification";
  let decisionBody = "Upload a document and run checks to see a recommendation here.";

  if (hasDoc && checks.length === 0) {
    decisionTone = "info";
    decisionTitle = "Unverified";
    decisionBody = "Document was uploaded, but no comparable fields were extracted — check scan quality or resubmit.";
  } else if (allPassed) {
    decisionTone = "success";
    decisionTitle = "Verified";
    decisionBody = "All submitted details match the uploaded document. No discrepancies found.";
  } else if (hasFailure) {
    decisionTone = "warning";
    decisionTitle = "Needs Review";
    decisionBody = `AI detected a discrepancy on ${failedCount} field${failedCount > 1 ? "s" : ""} between the uploaded ID and the application form. Manual review is required before approval.`;
  }

  // Extra informational fields (not covered by pass/fail checks) shown as neutral cards
  const infoFields = [
    { key: "id_number", label: "ID Number", value: fields.id_number },
    { key: "expiry_date", label: "Document Expiry", value: fields.expiry_date },
    { key: "document_type", label: "Document Type", value: fields.document_type },
  ].filter((f) => f.value);

  return (
    <div className="vp-page">
      {/* ---- Top bar ---- */}
      <div className="vp-topbar">
        <BackButton to={`/proposal/${id}`} />
        <h1>Document Verification</h1>
      </div>

      <div className="vp-layout">
        {/* ---- Main pipeline ---- */}
        <main className="vp-main">
          <div className="vp-breadcrumb">
            Verification Pipeline <span>›</span> <b>Case #{proposal.id}</b>
          </div>

          {/* Stage 1 */}
          <div className="vp-stage">
            <div className="vp-stage-rail">
              <div className={`vp-stage-dot ${hasDoc ? "vp-dot-done" : ""}`}>
                {hasDoc && <FaCheckCircle />}
              </div>
              <div className="vp-stage-line" />
            </div>
            <div className="vp-stage-card">
              <div className="vp-stage-head">
                <h2>Stage 1: Document Intake</h2>
                {hasDoc && <span className="vp-pill vp-pill-success">SUCCESS</span>}
              </div>
              {hasDoc ? (
                <div className="vp-doc-row">
                  <span className="vp-file-icon"><FaFileAlt /></span>
                  <div className="vp-doc-info">
                    <p className="mono">{proposal.document_filename}</p>
                    <p className="vp-muted">Successfully parsed</p>
                    {schemaUsed && (
                      <p className="vp-muted">Matched schema: <b>{schemaUsed}</b></p>
                    )}
                  </div>
                  {React.createElement(
                    "a",
                    {
                      className: "vp-link",
                      href: getProposalDocumentUrl(proposal.id),
                      target: "_blank",
                      rel: "noopener noreferrer",
                    },
                    "View Source"
                  )}
                </div>
              ) : (
                <p className="vp-muted">No document attached to this case.</p>
              )}
            </div>
          </div>

          {/* Stage 2 */}
          <div className="vp-stage">
            <div className="vp-stage-rail">
              <div className="vp-stage-dot vp-dot-current">2</div>
              <div className="vp-stage-line" />
            </div>
            <div className="vp-stage-card vp-stage-card-active">
              <div className="vp-stage-head">
                <h2>Stage 2: Validation Checklist</h2>
              </div>

              {checks.length === 0 && infoFields.length === 0 && (
                <p className="vp-muted">No comparable fields were extracted from the document.</p>
              )}

              <div className="vp-check-grid">
                {checks.map((c, i) => (
                  <div key={i} className={`vp-check-card ${c.valid ? "vp-check-pass" : "vp-check-fail"}`}>
                    <span className="vp-check-icon">
                      {c.valid ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <div>
                      <p className="vp-check-title">
                        {c.field.charAt(0).toUpperCase() + c.field.slice(1)} {c.valid ? "Matching" : "Mismatch"}
                      </p>
                      <p className="vp-check-sub">
                        {c.valid ? "Matches primary application record" : c.reason}
                      </p>
                    </div>
                  </div>
                ))}

                {infoFields.map((f) => (
                  <div key={f.key} className="vp-check-card vp-check-info">
                    <span className="vp-check-icon"><FaMinusCircle /></span>
                    <div>
                      <p className="vp-check-title">{f.label}</p>
                      <p className="vp-check-sub">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="vp-stage vp-stage-last">
            <div className="vp-stage-rail">
              <div className="vp-stage-dot">3</div>
            </div>
            <div className="vp-stage-card">
              <div className="vp-stage-head">
                <h2>Stage 3: Decision Engine</h2>
              </div>

              <div className={`vp-decision-banner vp-decision-${decisionTone}`}>
                <FaExclamationTriangle className="vp-decision-icon" />
                <div>
                  <p className="vp-decision-title">{decisionTitle}</p>
                  <p className="vp-decision-body">{decisionBody}</p>
                </div>
              </div>

              {Object.keys(fields).length > 0 && (
                <>
                  <span className="vp-extracted-label">Extracted Data</span>
                  <div className="vp-extracted-grid">
                    {Object.entries(fields)
                      .filter(([, v]) => v && typeof v !== "object")
                      .map(([k, v]) => (
                        <div key={k} className="vp-extracted-cell">
                          <span className="vp-json-path mono">$.{k}</span>
                          <span className="mono">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ---- Sticky action bar ---- */}
      <div className="vp-actionbar">
        <p>
          Case <b>#{proposal.id}</b> is currently {isPending ? "in manual review queue" : `marked as ${proposal.status}`}.
        </p>
      </div>
    </div>
  );
}

export default DocumentVerification;