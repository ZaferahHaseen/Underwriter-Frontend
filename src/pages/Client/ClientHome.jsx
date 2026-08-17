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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCySMM2qn5SRWK1ADIFWJ4jTQY-YE4OPCfDvU_Dm_kqviD9Hoo8K1bJWF5cwLolSSl80HmaJt7KeAUz8_AcQf7ig184wXY_mUE_l6FUVSSmvmDJNKpp_Ecc1kKLFntxNZElWzBmjx-_3-UZKdKGn_FrbipUvzcRhcC8ajloF44ZJpXivLt66bqTvnX1xbsqOSH_p-lFQCbtsZ6ssW1BRhu8weVD4FVNEJbW7Pgy0JHptqLB-NvcwpsJ",
    disabled: false,
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
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBW2XAdYF4l1b-mSTm2btmFdsOPMfT7ETSgzvtcdn-B52AER97kvBtIchP8C5e-Xay2fIxKB-DUTTOhfQiT4w7_K02quDAfnT2EmX4VpaE4NPUMbmzBCbzlaIR7Gf0cTJmCsdwhc-MRNEN2o5bo6t6BJhKaI8iqeARYy4sBomCKkjdUthFSCYXunldAmgz8ghpU3-3dZAtfz95jA-Q_D7OCU8qJlzZh0X6bk-AwmD9r2h2dhi_3xaCw",
    disabled: false,
  },
  {
    key: "property",
    title: "Property Insurance",
    description:
      "Protect your home and belongings with flexible coverage for tenants and homeowners.",
    icon: <FaHome />,
    tone: "property",
    stat: "Your properties",
    to: "/client/property",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAypfr93HfU70HTRYndhgrQGfIvATnOudocbw1C-vM6MLvPD8uK68obyCvfCp1cr9-AW4UPX9QMACtdKaGGYEZsB6K8nzjBZOiHMzVbRv_FDAqv1TJyULDRV4jboLNRPoZ-SdmqpgTrN21yc8wMNPyAr36zbckQ2qoLnIoCQ7m8DjM45yG3GqypCoaoB53ift3KgibPjTBxMrp1yLM9COLUzCYw2Jj0h_WZ1xTKLlHHPGOWXotXLJzX",
    disabled: true,
  },
  {
    key: "travel",
    title: "Travel Insurance",
    description:
      "Stay covered on your adventures with medical emergency support and trip cancellation protection.",
    icon: <FaPlane />,
    tone: "travel",
    stat: "Your trips",
    to: "/client/travel",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC5G2s7CD-Spk3YtqbNmUTYLiaOvjPz1bpVtZVjKBF4q4Dbw5F1I-haomA8TwLGAOOa4Gg-YICxe4jfKGqX7H9LPmpcgJpv8X4MT0VrxRaFt1O4X-F2LZXLeUDXz48quirKwgCSweSqX8gaam99LyCCkzi1arauhfEykLo3BHEMS79xUFURXCkQy9s8UmZy_oSnIpp5w9B1DTetjDgUXDia5hKcH34Yfu_gw7Xw5HuMeLkjkdITxlKg",
    disabled: true,
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
            className={`ch-card ${line.disabled ? "ch-card-disabled" : ""}`}
            style={{ backgroundImage: `url(${line.image})` }}
            onClick={() => !line.disabled && navigate(line.to)}
            disabled={line.disabled}
          >
            <div className="ch-card-overlay" />
            <div className="ch-card-body">
              <div className="ch-card-icon">{line.icon}</div>
              <h2>{line.title}</h2>
              <p className="ch-card-desc">{line.description}</p>
            </div>
            <div className="ch-card-footer">
              <span className="ch-card-stat">{line.stat.toUpperCase()}</span>
              <span className="ch-card-cta">
                {line.disabled ? "Coming soon" : "Open"} <FaArrowRight />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ClientHome;