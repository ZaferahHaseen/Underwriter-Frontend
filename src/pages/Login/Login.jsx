import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Login.css";

function Login() {
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  return (

    
    <div className="login-container">

      <div className="left-section">
        <h1>AI Underwriter System</h1>
        <p>Smart Insurance Risk Analysis Platform</p>
      </div>

      <div className="right-section">

        <h2>Select Your Role</h2>

        <div className="roles">

          <div
            onClick={() => setRole("client")}
            className={role === "client" ? "role-box active" : "role-box"}
          >
            <div className="emoji">👤</div>
            <h3>Client</h3>
          </div>

          <div
            onClick={() => setRole("underwriter")}
            className={role === "underwriter" ? "role-box active" : "role-box"}
          >
            <div className="emoji">🧑‍💼</div>
            <h3>Underwriter</h3>
          </div>

        </div>

        <input type="email" placeholder="Email" />

        <input type="password" placeholder="Password" />

        
        <button
  onClick={() => {
    if (role === "client") {
      navigate("/client/dashboard");
    } else if (role === "underwriter") {
      navigate("/underwriter/dashboard");
    } else {
      alert("Please select a role");
    }
  }}
>
  Login
</button>

      </div>

    </div>
  );
}

export default Login;