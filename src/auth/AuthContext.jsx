import { createContext, useContext, useState, useEffect } from "react";
import { API_BASE } from "../api/underwritingApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [role, setRole] = useState(() => localStorage.getItem("role"));
  const [fullName, setFullName] = useState(() => localStorage.getItem("full_name"));

  useEffect(() => {
    if (token) localStorage.setItem("access_token", token);
    else localStorage.removeItem("access_token");
  }, [token]);

  useEffect(() => {
    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");
  }, [role]);

  useEffect(() => {
    if (fullName) localStorage.setItem("full_name", fullName);
    else localStorage.removeItem("full_name");
  }, [fullName]);

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    setToken(data.access_token);
    setRole(data.role);
    setFullName(data.full_name);
    return data;
  }

  async function signup(full_name, email, password, role) {
    const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name, email, password, role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Signup failed");
    }
    const data = await res.json();
    setToken(data.access_token);
    setRole(data.role);
    setFullName(data.full_name);
    return data;
  }

  function logout() {
    setToken(null);
    setRole(null);
    setFullName(null);
  }

  return (
    <AuthContext.Provider value={{ token, role, fullName, login, signup, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}