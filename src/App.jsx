import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDashboard from "./pages/Client/ClientDashboard";
import ClientPolicy from "./pages/Client/ClientPolicy";
import ClientPolicyDetails from "./pages/Client/ClientPolicyDetails";
import ClientHome from "./pages/Client/ClientHome";
import ClientMotorPolicy from "./pages/Client/ClientMotorPolicy";
import MotorProposalForm from "./pages/Client/MotorProposalForm";
import UnderwriterDashboard from "./pages/Underwriter/UnderwriterDashboard";
import ProposalDetails from "./pages/Underwriter/ProposalDetails";
import RiskAnalysis from "./pages/Underwriter/RiskAnalysis";
import ProposalDashboard from "./pages/Underwriter/ProposalDashboard";
import DocumentVerification from "./pages/Underwriter/DocumentVerification";
import UnderwriterHome from "./pages/Underwriter/UnderwriterHome";
import MotorDashboard from "./pages/Underwriter/Motor/MotorDashboard";
import MotorProposalDetails from "./pages/Underwriter/Motor/MotorProposalDetails";
import MotorVehicleDetails from "./pages/Underwriter/Motor/MotorVehicleDetails";
import MotorRiskAnalysis from "./pages/Underwriter/Motor/MotorRiskAnalysis";
import MotorDocumentVerification from "./pages/Underwriter/Motor/MotorDocumentVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* ---- Client side (role="client" only — underwriters are bounced to their own home) ---- */}
        <Route
          path="/client/home"
          element={<ProtectedRoute role="client"><ClientHome /></ProtectedRoute>}
        />

        <Route
          path="/client/dashboard"
          element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>}
        />

        <Route
          path="/client/policy"
          element={<ProtectedRoute role="client"><ClientPolicy /></ProtectedRoute>}
        />

        <Route
          path="/client/policy/:id"
          element={<ProtectedRoute role="client"><ClientPolicyDetails /></ProtectedRoute>}
        />

        <Route
          path="/client/motor"
          element={<ProtectedRoute role="client"><ClientMotorPolicy /></ProtectedRoute>}
        />

        <Route
          path="/client/motor/proposal"
          element={<ProtectedRoute role="client"><MotorProposalForm /></ProtectedRoute>}
        />

        {/* ---- Underwriter side (role="underwriter" only — clients are bounced to their own home) ---- */}
        <Route
          path="/underwriter/home"
          element={<ProtectedRoute role="underwriter"><UnderwriterHome /></ProtectedRoute>}
        />

        <Route
          path="/underwriter/dashboard"
          element={<ProtectedRoute role="underwriter"><UnderwriterDashboard /></ProtectedRoute>}
        />

        {/* ---- Motor Insurance line (fleet-based) ---- */}
        <Route
          path="/underwriter/motor/dashboard"
          element={<ProtectedRoute role="underwriter"><MotorDashboard /></ProtectedRoute>}
        />

        <Route
          path="/motor-proposal/:id"
          element={<ProtectedRoute role="underwriter"><MotorProposalDetails /></ProtectedRoute>}
        />

        <Route
          path="/motor-proposal/:id/vehicle/:vehicleId"
          element={<ProtectedRoute role="underwriter"><MotorVehicleDetails /></ProtectedRoute>}
        />

        <Route
          path="/motor-risk-analysis/:id"
          element={<ProtectedRoute role="underwriter"><MotorRiskAnalysis /></ProtectedRoute>}
        />

        <Route
          path="/motor-document-verification/:id"
          element={<ProtectedRoute role="underwriter"><MotorDocumentVerification /></ProtectedRoute>}
        />

        <Route
          path="/proposal/:id"
          element={<ProtectedRoute role="underwriter"><ProposalDashboard /></ProtectedRoute>}
        />

        {/* Risk analysis is shared: underwriters open it both from a proposal
            (review) and as a standalone Quick Check tool — client role has
            no use for it, so it stays underwriter-only. */}
        <Route
          path="/risk-analysis/:id"
          element={<ProtectedRoute role="underwriter"><RiskAnalysis /></ProtectedRoute>}
        />

        <Route
          path="/document-verification/:id"
          element={<ProtectedRoute role="underwriter"><DocumentVerification /></ProtectedRoute>}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;