import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import ClientDashboard from "./pages/Client/ClientDashboard";
import UnderwriterDashboard from "./pages/Underwriter/UnderwriterDashboard";
import ProposalDetails from "./pages/Underwriter/ProposalDetails";
import RiskAnalysis from "./pages/Underwriter/RiskAnalysis";
import ProposalDashboard from "./pages/Underwriter/ProposalDashboard";
import DocumentVerification from "./pages/Underwriter/DocumentVerification";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/client/dashboard"
          element={
            <ProtectedRoute requiredRole="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/underwriter/dashboard"
          element={
            <ProtectedRoute requiredRole="underwriter">
              <UnderwriterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/proposal/:id"
          element={
            <ProtectedRoute requiredRole="underwriter">
              <ProposalDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/risk-analysis/:id"
          element={
            <ProtectedRoute requiredRole="underwriter">
              <RiskAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/document-verification/:id"
          element={
            <ProtectedRoute requiredRole="underwriter">
              <DocumentVerification />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;