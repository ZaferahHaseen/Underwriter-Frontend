import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaCarSide, FaArrowRight } from "react-icons/fa";
import "./ClientHome.css";
import BackButton from "../../components/BackButton";
import TopBar from "../../components/TopBar";

const LINES = [
  {
    key: "health",
    title: "Health & Life Insurance",
    description:
      "View your active policy, track its status, and apply for new health or life cover in a few minutes.",
    icon: <FaHeartbeat />,
    tone: "signal",
    stat: "Your policies",
    to: "/client/my-policy",
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
];

function ClientHome() {
  const navigate = useNavigate();

  return (
    <div className="ch-page">
      <div className="ch-header">
        <BackButton to="/" />
        <div className="ch-header-text">
          <h1>Welcome back</h1>
          <p className="ch-subhead">Choose an insurance line to view or apply.</p>
        </div>
        <TopBar homeTo="/client/home" />
      </div>

      <div className="ch-grid">
        {LINES.map((line) => (
          <button
            key={line.key}
            className={`ch-card ch-card-${line.tone}`}
            onClick={() => navigate(line.to)}
          >
            <div className={`ch-card-icon ch-card-icon-${line.tone}`}>{line.icon}</div>
            <h2>{line.title}</h2>
            <p className="ch-card-desc">{line.description}</p>
            <div className="ch-card-footer">
              <span className="ch-card-stat">{line.stat}</span>
              <span className="ch-card-cta">
                Open <FaArrowRight />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ClientHome;
