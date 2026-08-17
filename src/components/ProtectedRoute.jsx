import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "../api/underwritingApi";

/**
 * Wraps a route element and enforces the serious role-based access rules:
 *  - Not logged in at all -> back to the login screen.
 *  - Logged in but wrong role for this section (e.g. a client hitting an
 *    /underwriter/* route, or an underwriter hitting a /client/* route)
 *    -> sent to their own home screen instead of the page they tried to open.
 *
 * Usage: <Route path="/underwriter/home" element={<ProtectedRoute role="underwriter"><UnderwriterHome /></ProtectedRoute>} />
 */
function ProtectedRoute({ role, children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  const currentRole = getRole();

  if (role && currentRole !== role) {
    const fallback = currentRole === "underwriter" ? "/underwriter/home" : "/client/home";
    return <Navigate to={fallback} replace />;
  }

  return children;
}

export default ProtectedRoute;