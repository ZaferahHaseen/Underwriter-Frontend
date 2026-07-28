import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./BackButton.css";

/**
 * Consistent back-navigation control used on every page except Login.
 * Pass `to` for a fixed destination, otherwise it falls back to browser history.
 */
function BackButton({ to, label }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button className="back-button" onClick={handleClick} aria-label="Go back">
      <FaArrowLeft />
      {label && <span>{label}</span>}
    </button>
  );
}

export default BackButton;
