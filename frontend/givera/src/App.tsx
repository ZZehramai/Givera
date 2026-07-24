import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { PublicLayout } from "./components/public/PublicLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

import { Landing } from "./pages/public/Landing";
import { Login } from "./pages/public/Login";
import { Register } from "./pages/public/Register";
import { Dashboard } from "./pages/public/Dashboard";
import { Profile } from "./pages/public/Profile";
import { Notifications } from "./pages/public/Notifications";
import { CampaignList } from "./pages/public/CampaignList";
import { Donate } from "./pages/public/Donate";
import { RequestCampaign } from "./pages/public/RequestCampaign";
import { History } from "./pages/public/History";
import { Assistant } from "./pages/public/Assistant";
import { Transparency } from "./pages/public/Transparency";

import { AdminLogin } from "./pages/admin/AdminLogin";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminCampaignReview } from "./pages/admin/AdminCampaignReview";
import { Analysis } from "./pages/admin/Analysis";
import { UserManagement } from "./pages/admin/UserManagement";
import { AdminNotifications } from "./pages/admin/AdminNotifications";
import { AdminAssistant } from "./pages/admin/AdminAssistant";
import { AdminProfile } from "./pages/admin/AdminProfile";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Standalone auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Public donor portal */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route
            path="/disasters"
            element={
            <CampaignList
              category="disaster"
              eyebrow="Emergency response"
              title="Natural disaster relief"
              description="Verified campaigns responding to floods, wildfires, earthquakes, and other emergencies. Every campaign publishes its fund allocation." />

            } />
          
          <Route
            path="/underprivileged"
            element={
            <CampaignList
              category="underprivileged"
              eyebrow="Community programs"
              title="Underprivileged communities"
              description="Long-term programs for food security, education, housing, and clean water — each with transparent, audited allocation records." />

            } />
          
          <Route path="/donate" element={<Donate />} />
          <Route path="/request-campaign" element={<RequestCampaign />} />
          <Route path="/transparency" element={<Transparency />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/assistant" element={<Assistant />} />
        </Route>

        {/* Administrative console */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route
            path="disasters"
            element={
            <AdminCampaignReview
              category="disaster"
              eyebrow="Review queue"
              title="Natural disaster campaigns"
              description="Verify, approve, or request revisions on disaster-relief campaigns." />

            } />
          
          <Route
            path="underprivileged"
            element={
            <AdminCampaignReview
              category="underprivileged"
              eyebrow="Review queue"
              title="Underprivileged campaigns"
              description="Verify, approve, or request revisions on community-program campaigns." />

            } />
          
          <Route path="analysis" element={<Analysis />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="assistant" element={<AdminAssistant />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>);

}