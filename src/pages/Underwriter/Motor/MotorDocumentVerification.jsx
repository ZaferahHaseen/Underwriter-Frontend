import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCarSide, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
} from "react-icons/fa";
import "./MotorDocumentVerification.css";
import { getVehicleProposal, getVehicleProposalDocumentUrl } from "../../../api/underwritingApi";
import BackButton from "../../../components/BackButton";
import StatusStamp from "../../../components/StatusStamp";

// Real backend wired -- validation_results comes from OCR-vs-form comparison
// (app/document_validation/validator.py), one entry per checked field
// (currently: name, age). No per-vehicle grouping needed (flat model).
const USE_DUMMY_DATA = false;

function MotorDocumentVerification() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setLoading(false);
      return;
    }
    getVehicleProposal(id)
      .then((data) => {
        setProposal(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="mvp-page">
        <p className="mvp-loading">Loading case…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mvp-page">
        <BackButton to={`/motor-proposal/${id}`} />
        <p className="state-text error-text">Error: {error}</p>
      </div>
    );
  }

  if (!proposal) return null;

  const v = proposal.vehicle || {};
  const validationResults = proposal.validation_results || [];
  const extracted = proposal.extracted_fields || {};
  const hasDocument = !!proposal.document_filename;
  const failedCount = validationResults.filter((r) => !r.valid).length;

  let decisionTone = "success";
  let decisionTitle = "Document Verified";
  let decisionBody = "Extracted document details match the submitted form.";
  let DecisionIcon = FaCheckCircle;

  if (!hasDocument) {
    decisionTone = "warning";
    decisionTitle = "No Document Attached";
    decisionBody = "This proposal was created without an attached license/ID document (e.g. via bulk/manual batch entry).";
    DecisionIcon = FaExclamationTriangle;
  } else if (failedCount > 0) {
    decisionTone = "warning";
    decisionTitle = "Needs Review";
    decisionBody = `AI detected a mismatch on ${failedCount} field${failedCount > 1 ? "s" : ""} between the form and the submitted document. Manual review is required before approval.`;
    DecisionIcon = FaExclamationTriangle;
  }

  return (
    <div className="mvp-page">
      <div className="mvp-hero">
        <div className="mvp-topbar">
          <BackButton to={`/motor-proposal/${id}`} />
          <div className="mvp-topbar-text">
            <h1>Document Verification</h1>
            <p>{proposal.full_name} · {v.make} {v.model} · Case #{proposal.id}</p>
          </div>
          <StatusStamp status={proposal.status} />
        </div>
      </div>

      <div className="mvp-layout">
        <main className="mvp-main">
          <div className={`mvp-decision-banner mvp-decision-${decisionTone}`}>
            <DecisionIcon className="mvp-decision-icon" />
            <div>
              <p className="mvp-decision-title">{decisionTitle}</p>
              <p className="mvp-decision-body">{decisionBody}</p>
            </div>
          </div>

          {hasDocument && (
            <section className="mvp-card">
              <div className="mvp-card-head">
                <div className="mvp-card-head-title">
                  <span className="mvp-vehicle-icon"><FaCarSide /></span>
                  <div>
                    <h2>{v.make} {v.model}</h2>
                    <p className="mono mvp-reg">
                      <a href={getVehicleProposalDocumentUrl(proposal.id)} target="_blank" rel="noreferrer">
                        {proposal.document_filename}
                      </a>
                    </p>
                  </div>
                </div>
                <span className={`mvp-pill ${failedCount === 0 ? "mvp-pill-success" : "mvp-pill-warning"}`}>
                  {failedCount === 0 ? "All Clear" : `${failedCount} Issue${failedCount > 1 ? "s" : ""}`}
                </span>
              </div>

              <div className="mvp-check-grid">
                {validationResults.length === 0 && (
                  <p className="mra-list-empty">No fields were checked against the document.</p>
                )}
                {validationResults.map((r, i) => {
                  const ok = r.valid;
                  const Icon = ok ? FaCheckCircle : FaTimesCircle;
                  return (
                    <div key={i} className={`mvp-check-card ${ok ? "mvp-check-pass" : "mvp-check-fail"}`}>
                      <span className="mvp-check-icon"><Icon /></span>
                      <div>
                        <p className="mvp-check-title">{r.field}</p>
                        <p className="mvp-check-sub">
                          {ok ? "Matches" : r.reason}
                        </p>
                        {!ok && (
                          <p className="mvp-check-sub mono">
                            form: {String(r.form_value)} · doc: {String(r.document_value ?? r.document_computed_age ?? "—")}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </main>

        <aside className="mvp-side">
          <div className="mvp-side-card">
            <span className="mvp-side-title">Vehicle</span>
            <div className="mvp-detail-row">
              <span>Make / Model</span>
              <b>{v.make} {v.model}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Year</span>
              <b>{v.year}</b>
            </div>
          </div>

          <div className="mvp-side-card">
            <span className="mvp-side-title">Case</span>
            <div className="mvp-detail-row">
              <span>Reference</span>
              <b>#{proposal.id}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Status</span>
              <b>{proposal.status}</b>
            </div>
            {extracted.name && (
              <div className="mvp-detail-row">
                <span>Extracted Name</span>
                <b>{extracted.name}</b>
              </div>
            )}
            {extracted.dob && (
              <div className="mvp-detail-row">
                <span>Extracted DOB</span>
                <b>{extracted.dob}</b>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MotorDocumentVerification;