import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaCarSide, FaHome, FaPlane, FaArrowRight } from "react-icons/fa";
import "./ClientHome.css";
import PageHeader from "../../components/PageHeader";

const LINES = [
  {
    key: "health",
    title: "Health & Life Insurance",
    description:
      "View your active policy, track its status, and apply for new health or life cover in a few minutes.",
    icon: <FaHeartbeat />,
    tone: "signal",
    stat: "Your policies",
    to: "/client/policy",
  },
  {
    key: "motor",
    title: "Motor Insurance",
    description:
      "View your vehicle policy details, or submit a proposal for one vehicle — or a whole fleet — in one go.",
    icon: <FaCarSide />,
    tone: "motor",
    stat: "Your vehicles",
    to: "/client/motor",
  },
  {
    key: "property",
    title: "Property Insurance",
    description:
      "Protect your home and belongings with flexible coverage for tenants and homeowners.",
    icon: <FaHome />,
    tone: "property",
    stat: "Your properties",
    comingSoon: true,
  },
  {
    key: "travel",
    title: "Travel Insurance",
    description:
      "Stay covered on your adventures with medical emergency support and trip cancellation protection.",
    icon: <FaPlane />,
    tone: "travel",
    stat: "Your trips",
    comingSoon: true,
  },
];

function ClientHome() {
  const navigate = useNavigate();

  return (
    <div className="ch-page">
      <PageHeader
        theme="neutral"
        title="Welcome back"
        subtitle="Choose an insurance line to view or apply."
        backTo="/"
        homeTo="/client/home"
      />

      <div className="ch-grid">
        {LINES.map((line) => (
          <button
            key={line.key}
            className={`ch-card ch-card-${line.tone}${line.comingSoon ? " ch-card-soon" : ""}`}
            onClick={() => !line.comingSoon && navigate(line.to)}
            disabled={line.comingSoon}
          >
            <div className={`ch-card-icon ch-card-icon-${line.tone}`}>{line.icon}</div>
            <h2>{line.title}</h2>
            <p className="ch-card-desc">{line.description}</p>
            <div className="ch-card-footer">
              <span className="ch-card-stat">{line.stat}</span>
              {line.comingSoon ? (
                <span className="ch-card-cta ch-card-cta-soon">
                  Coming soon <FaArrowRight />
                </span>
              ) : (
                <span className="ch-card-cta">
                  Open <FaArrowRight />
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ClientHome;