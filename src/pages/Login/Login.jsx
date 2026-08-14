import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaUserTie } from "react-icons/fa";
import "./Login.css";
import { login, signup } from "../../api/underwritingApi";

function Login() {
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Real auth against the backend (app/auth/router.py).
  // The "Username" field doubles as email — that's the only text field the
  // existing form has, and the backend's users table is keyed on email.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role || !username || !password) return;

    setSubmitting(true);
    try {
      const data = await login(username, password);
      routeByRole(data.role);
    } catch (loginErr) {
      // No account with this email/password yet -> offer to create one
      // with the role currently selected on screen, so the same form
      // handles both sign-in and first-time sign-up without new UI.
      const fullName = window.prompt(
        "No account found for that email/password. Enter your full name to create a new account (Cancel to go back):"
      );
      if (!fullName) {
        setSubmitting(false);
        alert(loginErr.message || "Login failed.");
        return;
      }
      try {
        const data = await signup(fullName, username, password, role);
        routeByRole(data.role);
      } catch (signupErr) {
        setSubmitting(false);
        alert(signupErr.message || "Could not create account.");
      }
    }
  };

  const routeByRole = (serverRole) => {
    if (serverRole === "underwriter") navigate("/underwriter/home");
    else navigate("/client/home");
  };

  return (
    <div className="login-container">

      <div className="left-section">
        <div className="brand-mark">
          <span className="brand-dot" />
          AI UNDERWRITER
        </div>

        <h1>Smarter risk decisions, backed by data.</h1>

        <p>
          A single platform for submitting insurance proposals and reviewing
          AI-assisted risk analysis — built for clients and underwriters alike.
        </p>

        <div className="left-gauge" aria-hidden="true">
          <svg viewBox="0 0 200 124" width="220">
            <defs>
              <linearGradient
                id="loginGaugeGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#1E9E63" />
                <stop offset="50%" stopColor="#DB9A2C" />
                <stop offset="100%" stopColor="#D64545" />
              </linearGradient>
            </defs>

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#loginGaugeGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              opacity="0.85"
            />

            <line
              x1="100"
              y1="100"
              x2="140"
              y2="55"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <circle
              cx="100"
              cy="100"
              r="6"
              fill="white"
            />
          </svg>
        </div>
      </div>

      <div className="right-section">

        <form className="login-form" onSubmit={handleSubmit}>

          <h2>Sign in to continue</h2>

          <p className="subhead">
            Select your role to get started
          </p>

          {/* Role Selection */}
          <div className="roles">

            <div
              onClick={() => setRole("client")}
              className={
                role === "client"
                  ? "role-box active"
                  : "role-box"
              }
            >
              <FaUser className="role-icon" />

              <h3>Client</h3>

              <p>Proposals &amp; policies</p>
            </div>

            <div
              onClick={() => setRole("underwriter")}
              className={
                role === "underwriter"
                  ? "role-box active"
                  : "role-box"
              }
            >
              <FaUserTie className="role-icon" />

              <h3>Underwriter</h3>

              <p>Review proposals</p>
            </div>

          </div>

          {/* Username */}
          {role && (
            <>
              <label className="field-label">
                Username
              </label>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              {/* Password */}
              <label className="field-label">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={!role}
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;