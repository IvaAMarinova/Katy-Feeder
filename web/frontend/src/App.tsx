import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/login/page";
import Dashboard from "@/pages/dashboard/page";
import Pet from "@/pages/pet/page";
import FeederDetails from "@/pages/feeders/page";

function App() {
  return (
    <div className="w-full min-h-screen bg-white text-gray-700">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pet/:id" element={<Pet />} />
          <Route path="/feeders/:id" element={<FeederDetails />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
