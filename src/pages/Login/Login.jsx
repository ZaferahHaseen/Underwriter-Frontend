import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUser, FaUserTie, FaExclamationCircle, FaTimes } from "react-icons/fa";
import "./Login.css";
import { login, signup } from "../../api/underwritingApi";

function Login() {
  const [role, setRole] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // doubles as email
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Auto-dismiss the toast after 4s.
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error]);

  // Real, strict role-based auth against the backend (app/auth/router.py).
  // The role selected on screen is sent with the login request; the
  // backend rejects (403) if the account was actually registered under
  // a different role — e.g. an underwriter account cannot sign in through
  // the "Client" box, and vice versa.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!role || !username || !password) return;
    if (mode === "signup" && !fullName) {
      setError("Enter your full name to create an account.");
      return;
    }

    setSubmitting(true);
    try {
      const data =
        mode === "signup"
          ? await signup(fullName, username, password, role)
          : await login(username, password, role);
      routeByRole(data.role);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const routeByRole = (serverRole) => {
    if (serverRole === "underwriter") navigate("/underwriter/home");
    else navigate("/client/home");
  };

  return (
    <div className="login-container">

      {error && (
        <div className="login-toast" role="alert">
          <FaExclamationCircle className="login-toast-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="login-toast-close"
            onClick={() => setError(null)}
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      )}

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

          <h2>{mode === "signup" ? "Create your account" : "Sign in to continue"}</h2>

          <p className="subhead">
            Select your role to get started
          </p>

          {/* Role Selection */}
          <div className="roles">

            <div
              onClick={() => { setRole("client"); setError(null); }}
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
              onClick={() => { setRole("underwriter"); setError(null); }}
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

          {/* Login / Sign up mode */}
          {role && (
            <div className="client-mode-tabs">
              <button
                type="button"
                className={mode === "login" ? "mode-tab active" : "mode-tab"}
                onClick={() => { setMode("login"); setError(null); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={mode === "signup" ? "mode-tab active" : "mode-tab"}
                onClick={() => { setMode("signup"); setError(null); }}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Fields */}
          {role && (
            <>
              {mode === "signup" && (
                <>
                  <label className="field-label">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </>
              )}

              <label className="field-label">
                Email
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <label className="field-label">
                Password
              </label>

              <input
                type="password"
                placeholder={mode === "signup" ? "At least 8 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <p className="login-hint">
                Signing in as <strong>{role === "underwriter" ? "Underwriter" : "Client"}</strong>.
                Accounts registered under a different role cannot sign in here.
              </p>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={!role || submitting}
          >
            {submitting
              ? mode === "signup" ? "Creating account…" : "Signing in…"
              : mode === "signup" ? "Create Account" : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Login;