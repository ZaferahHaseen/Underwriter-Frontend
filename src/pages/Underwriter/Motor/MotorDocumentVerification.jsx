import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaCarSide, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
} from "react-icons/fa";
import "./MotorDocumentVerification.css";
import { getDummyMotorProposal } from "../../../api/dummyMotorProposals";
import BackButton from "../../../components/BackButton";
import StatusStamp from "../../../components/StatusStamp";

// Flip to false once the backend teammate's motor document endpoint is live.
const USE_DUMMY_DATA = true;

const STATUS_META = {
  VERIFIED: { icon: FaCheckCircle, cls: "mvp-check-pass", label: "Verified" },
  MISMATCH: { icon: FaTimesCircle, cls: "mvp-check-fail", label: "Mismatch" },
  FLAGGED: { icon: FaExclamationTriangle, cls: "mvp-check-warn", label: "Flagged" },
  MISSING: { icon: FaExclamationTriangle, cls: "mvp-check-warn", label: "Missing" },
};

function MotorDocumentVerification() {
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_DUMMY_DATA) {
      setProposal(getDummyMotorProposal(id));
      setLoading(false);
      return;
    }
    // Real endpoint wiring goes here once ready.
    setLoading(false);
  }, [id]);

  if (loading || !proposal) {
    return (
      <div className="mvp-page">
        <p className="mvp-loading">Loading case…</p>
      </div>
    );
  }

  const allDocs = proposal.vehicles.flatMap((v) => v.documents);
  const failedCount = allDocs.filter((d) => d.status !== "VERIFIED").length;
  const vehiclesFlagged = proposal.vehicles.filter((v) => v.documents.some((d) => d.status !== "VERIFIED")).length;

  let decisionTone = "success";
  let decisionTitle = "All Documents Verified";
  let decisionBody = "Every vehicle on this policy has matching, verified documentation.";
  let DecisionIcon = FaCheckCircle;

  if (failedCount > 0) {
    decisionTone = "warning";
    decisionTitle = "Needs Review";
    decisionBody = `AI detected an issue on ${failedCount} document${failedCount > 1 ? "s" : ""} across ${vehiclesFlagged} vehicle${vehiclesFlagged > 1 ? "s" : ""}. Manual review is required before approval.`;
    DecisionIcon = FaExclamationTriangle;
  }

  return (
    <div className="mvp-page">
      <div className="mvp-hero">
        <div className="mvp-topbar">
          <BackButton to={`/motor-proposal/${id}`} />
          <div className="mvp-topbar-text">
            <h1>Document Verification</h1>
            <p>{proposal.full_name} · {proposal.fleet_type} · Case #{proposal.id}</p>
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

          {proposal.vehicles.map((v) => {
            const vFailed = v.documents.filter((d) => d.status !== "VERIFIED").length;
            return (
              <section className="mvp-card" key={v.vehicle_id}>
                <div className="mvp-card-head">
                  <div className="mvp-card-head-title">
                    <span className="mvp-vehicle-icon"><FaCarSide /></span>
                    <div>
                      <h2>{v.vehicle_make} {v.vehicle_model}</h2>
                      <p className="mono mvp-reg">{v.registration_number}</p>
                    </div>
                  </div>
                  <span className={`mvp-pill ${vFailed === 0 ? "mvp-pill-success" : "mvp-pill-warning"}`}>
                    {vFailed === 0 ? "All Clear" : `${vFailed} Issue${vFailed > 1 ? "s" : ""}`}
                  </span>
                </div>

                <div className="mvp-check-grid">
                  {v.documents.map((d, i) => {
                    const meta = STATUS_META[d.status] || STATUS_META.MISSING;
                    const Icon = meta.icon;
                    return (
                      <div key={i} className={`mvp-check-card ${meta.cls}`}>
                        <span className="mvp-check-icon"><Icon /></span>
                        <div>
                          <p className="mvp-check-title">{d.name}</p>
                          <p className="mvp-check-sub">{meta.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </main>

        <aside className="mvp-side">
          <div className="mvp-side-card">
            <span className="mvp-side-title">Policyholder</span>
            <div className="mvp-detail-row">
              <span>Type</span>
              <b>{proposal.fleet_type}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Occupation</span>
              <b>{proposal.occupation}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Years With Insurer</span>
              <b>{proposal.years_with_insurer}</b>
            </div>
          </div>

          <div className="mvp-side-card">
            <span className="mvp-side-title">Case</span>
            <div className="mvp-detail-row">
              <span>Reference</span>
              <b>#{proposal.id}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Vehicles</span>
              <b>{proposal.vehicles.length}</b>
            </div>
            <div className="mvp-detail-row">
              <span>Status</span>
              <b>{proposal.status}</b>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MotorDocumentVerification;
