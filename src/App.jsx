import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ClientDashboard from "./pages/Client/ClientDashboard";
import ClientPolicy from "./pages/Client/ClientPolicy";
import UnderwriterDashboard from "./pages/Underwriter/UnderwriterDashboard";
import ProposalDetails from "./pages/Underwriter/ProposalDetails";
import RiskAnalysis from "./pages/Underwriter/RiskAnalysis";
import ProposalDashboard from "./pages/Underwriter/ProposalDashboard";
import DocumentVerification from "./pages/Underwriter/DocumentVerification";
import UnderwriterHome from "./pages/Underwriter/UnderwriterHome";
import MotorDashboard from "./pages/Underwriter/Motor/MotorDashboard";
import MotorProposalDetails from "./pages/Underwriter/Motor/MotorProposalDetails";
import MotorRiskAnalysis from "./pages/Underwriter/Motor/MotorRiskAnalysis";
import MotorDocumentVerification from "./pages/Underwriter/Motor/MotorDocumentVerification";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route
          path="/client/dashboard"
          element={<ClientDashboard />}
        />

        <Route
          path="/client/my-policy"
          element={<ClientPolicy />}
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