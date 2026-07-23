import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login/Login";
import ClientDashboard from "./pages/Client/ClientDashboard";
import UnderwriterDashboard from "./pages/Underwriter/UnderwriterDashboard";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;