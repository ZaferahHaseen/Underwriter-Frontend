import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaUser, FaUserTie } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === "client") navigate("/client/dashboard");
    else if (role === "underwriter") navigate("/underwriter/dashboard");
    else alert("Please select a role to continue");
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
              onClick={() => setRole("client")}
              className={role === "client" ? "role-box active" : "role-box"}
            >
              <FaUser className="role-icon" />
              <h3>Client</h3>
              <p>Submit a proposal</p>
            </div>

            <div
              onClick={() => setRole("underwriter")}
              className={role === "underwriter" ? "role-box active" : "role-box"}
            >
              <FaUserTie className="role-icon" />
              <h3>Underwriter</h3>
              <p>Review proposals</p>
            </div>
          </div>

          <label className="field-label">Email</label>
          <input type="email" placeholder="you@company.com" />

          <label className="field-label">Password</label>
          <input type="password" placeholder="••••••••" />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
