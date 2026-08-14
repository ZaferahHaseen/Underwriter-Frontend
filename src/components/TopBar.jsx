import { useNavigate } from "react-router-dom";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import "./TopBar.css";
import { clearAuth } from "../api/underwritingApi";

/**
 * Consistent Home + Logout controls, shown top-right on every page.
 * `homeTo` should be "/client/home" on client pages and "/underwriter/home"
 * on underwriter pages. Logout is a dummy action (no real auth session yet)
 * so it simply returns to the login screen.
 */
function TopBar({ homeTo = "/" }) {
  const navigate = useNavigate();

  return (
    <div className="topbar-actions">
      <button
        type="button"
        className="topbar-btn"
        onClick={() => navigate(homeTo)}
        aria-label="Home"
        title="Home"
      >
        <FaHome />
      </button>
      <button
        type="button"
        className="topbar-btn topbar-btn-logout"
        onClick={() => { clearAuth(); navigate("/"); }}
        aria-label="Log out"
        title="Log out"
      >
        <FaSignOutAlt />
      </button>
    </div>
  );
}

export default TopBar;