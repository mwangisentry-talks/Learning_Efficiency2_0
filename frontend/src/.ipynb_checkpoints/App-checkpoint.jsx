import { BrowserRouter, Routes, Route } from "react-router-dom";
import PhDDashboard from "./components/phd_dashboard";
import PhDDashboardFull from "./components/phd_dashboard_full";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhDDashboard />} />
        <Route path="/live" element={<PhDDashboardFull />} />
      </Routes>
    </BrowserRouter>
  );
}
