import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
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

        {/* ---- Client side ---- */}
        <Route
          path="/client/home"
          element={<ClientHome />}
        />

        <Route
          path="/client/dashboard"
          element={<ClientDashboard />}
        />



        <Route
          path="/client/policy"
          element={<ClientPolicy />}
        />

        <Route
          path="/client/policy/:id"
          element={<ClientPolicyDetails />}
        />

        <Route
          path="/client/motor"
          element={<ClientMotorPolicy />}
        />

        <Route
          path="/client/motor/proposal"
          element={<MotorProposalForm />}
        />

        <Route
          path="/underwriter/home"
          element={<UnderwriterHome />}
        />

        <Route
          path="/underwriter/dashboard"
          element={<UnderwriterDashboard />}
        />

        {/* ---- Motor Insurance line (fleet-based) ---- */}
        <Route
          path="/underwriter/motor/dashboard"
          element={<MotorDashboard />}
        />

        <Route
          path="/motor-proposal/:id"
          element={<MotorProposalDetails />}
        />

        <Route
          path="/motor-proposal/:id/vehicle/:vehicleId"
          element={<MotorVehicleDetails />}
        />

        <Route
          path="/motor-risk-analysis/:id"
          element={<MotorRiskAnalysis />}
        />

        <Route
          path="/motor-document-verification/:id"
          element={<MotorDocumentVerification />}
        />

        <Route
          path="/proposal/:id"
          element={<ProposalDashboard />}
        />

        <Route
          path="/risk-analysis/:id"
          element={<RiskAnalysis />}
        />

        <Route
          path="/document-verification/:id"
          element={<DocumentVerification />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
