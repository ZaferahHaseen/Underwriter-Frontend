import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaFileAlt, FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaInfoCircle,
} from "react-icons/fa";
import "./DocumentVerification.css";
import { getProposal, getProposalDocumentUrl } from "../../api/underwritingApi";
import PageHeader from "../../components/PageHeader";
import { formatName } from "../../utils/format";

// "id_number" -> "Id Number", "dob" -> "Dob" — humanizes raw backend field
// keys instead of leaking snake_case into the checklist title.
function humanizeField(field) {
  return field
    .replace(/_/g, " ")
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

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
  const schemaUsed = proposal.schema_used;
  const failedCount = checks.filter((c) => !c.valid).length;
  const allPassed = hasDoc && checks.length > 0 && failedCount === 0;
  const hasFailure = failedCount > 0;

  let decisionTone = "info";
  let decisionTitle = "Awaiting Verification";
  let decisionBody = "Upload a document and run checks to see a recommendation here.";
  let DecisionIcon = FaInfoCircle;

  if (hasDoc && checks.length === 0) {
    decisionTone = "info";
    decisionTitle = "Unverified";
    decisionBody = "Document was uploaded, but no comparable fields were extracted — check scan quality or resubmit.";
    DecisionIcon = FaInfoCircle;
  } else if (allPassed) {
    decisionTone = "success";
    decisionTitle = "Verified";
    decisionBody = "All submitted details match the uploaded document. No discrepancies found.";
    DecisionIcon = FaCheckCircle;
  } else if (hasFailure) {
    decisionTone = "warning";
    decisionTitle = "Needs Review";
    decisionBody = `AI detected a discrepancy on ${failedCount} field${failedCount > 1 ? "s" : ""} between the uploaded ID and the application form. Manual review is required before approval.`;
    DecisionIcon = FaExclamationTriangle;
  }

  // Only the identity fields worth an underwriter's attention — no raw JSON dump.
  const identityFields = [
    { label: "Document Type", value: fields.document_type },
    { label: "Name on Document", value: fields.name },
    { label: "Date of Birth", value: fields.dob },
    { label: "ID Number", value: fields.id_number },
    { label: "Expiry Date", value: fields.expiry_date },
  ].filter((f) => f.value);

  return (
    <div className="vp-page">
      {/* ---- Hero header ---- */}
      <PageHeader
        theme="health"
        title="Document Verification"
        subtitle={`${formatName(proposal.full_name)} · Case #${proposal.id}`}
        backTo={`/proposal/${id}`}
        homeTo="/underwriter/home"
      />

      <div className="vp-layout">
        {/* ---- Main column ---- */}
        <main className="vp-main">
          {/* Decision — the one thing an underwriter needs first */}
          <div className={`vp-decision-banner vp-decision-${decisionTone}`}>
            <DecisionIcon className="vp-decision-icon" />
            <div>
              <p className="vp-decision-title">{decisionTitle}</p>
              <p className="vp-decision-body">{decisionBody}</p>
            </div>
          </div>

          {/* Document */}
          <section className="vp-card">
            <div className="vp-card-head">
              <h2>Attached Document</h2>
              {hasDoc && <span className="vp-pill vp-pill-success">Parsed</span>}
            </div>

            {hasDoc ? (
              <div className="vp-doc-row">
                <span className="vp-file-icon"><FaFileAlt /></span>
                <div className="vp-doc-info">
                  <p className="mono">{proposal.document_filename}</p>
                  {schemaUsed && <p className="vp-muted-inline">Matched schema: <b>{schemaUsed}</b></p>}
                </div>
                <a
                  className="vp-link"
                  href={getProposalDocumentUrl(proposal.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Source
                </a>
              </div>
            ) : (
              <p className="vp-muted">No document attached to this case.</p>
            )}
          </section>

          {/* Validation checklist */}
          <section className="vp-card">
            <div className="vp-card-head">
              <h2>Validation Checklist</h2>
            </div>

            {checks.length === 0 ? (
              <p className="vp-muted">No comparable fields were extracted from the document.</p>
            ) : (
              <div className="vp-check-grid">
                {checks.map((c, i) => (
                  <div key={i} className={`vp-check-card ${c.valid ? "vp-check-pass" : "vp-check-fail"}`}>
                    <span className="vp-check-icon">
                      {c.valid ? <FaCheckCircle /> : <FaTimesCircle />}
                    </span>
                    <div>
                      <p className="vp-check-title">
                        {humanizeField(c.field)} {c.valid ? "Matching" : "Mismatch"}
                      </p>
                      <p className="vp-check-sub">
                        {c.valid ? "Matches primary application record" : c.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* ---- Right summary rail ---- */}
        <aside className="vp-side">
          <div className="vp-side-card">
            <span className="vp-side-title">Extracted Identity</span>
            {identityFields.length === 0 ? (
              <p className="vp-muted-inline">Nothing extracted yet.</p>
            ) : (
              identityFields.map((f) => (
                <div key={f.label} className="vp-detail-row">
                  <span>{f.label}</span>
                  <b>{f.value}</b>
                </div>
              ))
            )}
          </div>

          <div className="vp-side-card">
            <span className="vp-side-title">Case</span>
            <div className="vp-detail-row">
              <span>Reference</span>
              <b>#{proposal.id}</b>
            </div>
            <div className="vp-detail-row">
              <span>Status</span>
              <b>{proposal.status}</b>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DocumentVerification;