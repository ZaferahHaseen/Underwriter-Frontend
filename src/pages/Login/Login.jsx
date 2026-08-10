import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaUserTie } from "react-icons/fa";
import "./Login.css";
import { clientLogin } from "../../api/underwritingApi";

function Login() {
  const [role, setRole] = useState("");
  const [clientMode, setClientMode] = useState("new"); // "new" | "existing"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select a role to continue.");
      return;
    }

    if (role === "underwriter") {
      navigate("/underwriter/home");
      return;
    }

    // Client, submitting a brand new proposal — no email lookup needed.
    if (clientMode === "new") {
      navigate("/client/dashboard");
      return;
    }

    // Client, returning to view an existing policy — validate + look up by email.
    if (!email.trim()) {
      setError("Enter your email to continue.");
      return;
    }

    try {
      setLoading(true);
      const data = await clientLogin(email.trim());
      // Stash the email (and the data we already fetched) so the policy
      // page can restore state on refresh without asking the user to log in again.
      sessionStorage.setItem("client_email", email.trim());
      sessionStorage.setItem("client_login_data", JSON.stringify(data));
      navigate("/client/my-policy");
    } catch (err) {
      setError(err.message || "We couldn't find a policy for that email.");
    } finally {
      setLoading(false);
    }
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
              <linearGradient id="loginGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E9E63" />
                <stop offset="50%" stopColor="#DB9A2C" />
                <stop offset="100%" stopColor="#D64545" />
              </linearGradient>
            </defs>
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="14" strokeLinecap="round" />
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#loginGaugeGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
            <line x1="100" y1="100" x2="140" y2="55" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="100" r="6" fill="white" />
          </svg>
        </div>
      </div>

      <div className="right-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Sign in to continue</h2>
          <p className="subhead">Select your role to get started</p>

          <div className="roles">
            <div
              onClick={() => { setRole("client"); setError(null); }}
              className={role === "client" ? "role-box active" : "role-box"}
            >
              <FaUser className="role-icon" />
              <h3>Client</h3>
              <p>Proposals &amp; policies</p>
            </div>

            <div
              onClick={() => { setRole("underwriter"); setError(null); }}
              className={role === "underwriter" ? "role-box active" : "role-box"}
            >
              <FaUserTie className="role-icon" />
              <h3>Underwriter</h3>
              <p>Review proposals</p>
            </div>
          </div>

          {role === "client" && (
            <div className="client-mode-tabs">
              <button
                type="button"
                className={clientMode === "new" ? "mode-tab active" : "mode-tab"}
                onClick={() => { setClientMode("new"); setError(null); }}
              >
                New Proposal
              </button>
              <button
                type="button"
                className={clientMode === "existing" ? "mode-tab active" : "mode-tab"}
                onClick={() => { setClientMode("existing"); setError(null); }}
              >
                View My Policy
              </button>
            </div>
          )}

          {(role !== "client" || clientMode === "existing") && (
            <>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}

          {role === "underwriter" && (
            <>
              <label className="field-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}

          {role === "client" && clientMode === "existing" && (
            <p className="login-hint">
              We'll look up your details and current policy using this email.
            </p>
          )}

          {error && <div className="inline-error login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading
              ? "Signing in…"
              : role === "client" && clientMode === "existing"
              ? "View My Policy"
              : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
