import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ClientDashboard from "./pages/Client/ClientDashboard";
import UnderwriterDashboard from "./pages/Underwriter/UnderwriterDashboard";
import ProposalDetails from "./pages/Underwriter/ProposalDetails";
import RiskAnalysis from "./pages/Underwriter/RiskAnalysis";


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
          path="/underwriter/dashboard"
          element={<UnderwriterDashboard />}
        />

        <Route
          path="/proposal/:id"
          element={<ProposalDetails />}
        />

        <Route
          path="/risk-analysis/:id"
          element={<RiskAnalysis />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;