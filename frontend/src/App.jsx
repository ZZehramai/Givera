import "./App.css"
import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import Profile from "./pages/Profile";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import AdminCampaigns from "./pages/AdminCampaigns";
import CampaignDetail from "./pages/CampaignDetailReference";
import Campaigns from "./pages/Campaigns";
import CreateCampaign from "./pages/CreateCampaign";
import MyCampaigns from "./pages/MyCampaigns";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
    
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/campaigns/create"
            element={
              <ProtectedRoute>
                <CreateCampaign />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-campaigns"
            element={
              <ProtectedRoute>
                <MyCampaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/campaigns"
            element={
              <ProtectedRoute adminOnly>
                <AdminCampaigns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
