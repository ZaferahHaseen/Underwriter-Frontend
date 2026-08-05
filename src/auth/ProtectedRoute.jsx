import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // Logged in, but wrong role for this page — bounce to their own dashboard.
    const home = role === "underwriter" ? "/underwriter/dashboard" : "/client/dashboard";
    return <Navigate to={home} replace />;
  }

  return children;
}