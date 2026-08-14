import { useNavigate } from "react-router-dom";
import { FaHeartbeat, FaCarSide, FaArrowRight } from "react-icons/fa";
import "./UnderwriterHome.css";
import PageHeader from "../../components/PageHeader";

const LINES = [
  {
    key: "health",
    title: "Health & Life Insurance",
    description:
      "Review individual proposals — medical profile, lifestyle factors, and financial history — with AI-assisted risk scoring.",
    icon: <FaHeartbeat />,
    tone: "signal",
    stat: "Individual applicants",
    to: "/underwriter/dashboard",
  },
  {
    key: "motor",
    title: "Motor Insurance",
    description:
      "Review vehicle and fleet proposals — vehicle profile, driving history, and claims record — with per-vehicle AI risk scoring.",
    icon: <FaCarSide />,
    tone: "motor",
    stat: "Single vehicles & fleets",
    to: "/underwriter/motor/dashboard",
  },
];

function UnderwriterHome() {
  const navigate = useNavigate();

  return (
    <div className="uh-page">
      <PageHeader
        theme="neutral"
        title="Welcome back, Underwriter"
        subtitle="Choose an insurance line to review proposals in."
        backTo="/"
        homeTo="/underwriter/home"
      />

      <div className="uh-grid">
        {LINES.map((line) => (
          <button
            key={line.key}
            className={`uh-card uh-card-${line.tone}`}
            onClick={() => navigate(line.to)}
          >
            <div className={`uh-card-icon uh-card-icon-${line.tone}`}>{line.icon}</div>
            <h2>{line.title}</h2>
            <p className="uh-card-desc">{line.description}</p>
            <div className="uh-card-footer">
              <span className="uh-card-stat">{line.stat}</span>
              <span className="uh-card-cta">
                Open <FaArrowRight />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default UnderwriterHome;
