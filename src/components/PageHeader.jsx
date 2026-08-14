import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaSignOutAlt } from "react-icons/fa";
import "./PageHeader.css";

/**
 * PageHeader — the ONE navbar used on every screen after login.
 *
 * theme:
 *   "health"  -> blue header  (Health & Life Insurance pages)
 *   "motor"   -> green header (Motor Insurance pages)
 *   "neutral" -> dark navy header (hub pages that cover both lines,
 *                e.g. Client Home / Underwriter Home)
 *
 * Every page gets, in this exact order: a circular back-arrow button,
 * an optional avatar, the title/subtitle, optional badge/actions, then
 * the Home and Logout buttons pinned to the right.
 */
function PageHeader({
  theme = "neutral",
  eyebrow,
  title,
  subtitle,
  avatar,
  badge,
  actions,
  backTo,
  homeTo = "/",
  onLogout,
  compact = false,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate("/");
  };

  return (
    <header className={`ph-header ph-theme-${theme} ${compact ? "ph-compact" : ""}`}>
      <div className="ph-row">
        <button
          type="button"
          className="ph-icon-btn ph-back"
          onClick={handleBack}
          aria-label="Go back"
          title="Go back"
        >
          <FaArrowLeft />
        </button>

        {avatar && <div className="ph-avatar">{avatar}</div>}

        <div className="ph-titles">
          {eyebrow && <span className="ph-eyebrow">{eyebrow}</span>}
          {typeof title === "string" ? <h1>{title}</h1> : title}
          {subtitle && <p className="ph-subtitle">{subtitle}</p>}
        </div>

        {badge && <div className="ph-badge-slot">{badge}</div>}
        {actions && <div className="ph-actions-slot">{actions}</div>}

        <div className="ph-controls">
          <button
            type="button"
            className="ph-icon-btn"
            onClick={() => navigate(homeTo)}
            aria-label="Home"
            title="Home"
          >
            <FaHome />
          </button>
          <button
            type="button"
            className="ph-icon-btn ph-logout"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
