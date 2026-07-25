import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const access = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!access) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (adminOnly && user?.role !== "admin" && !user?.is_staff) {
    return <Navigate to="/campaigns" replace />;
  }

  return children;
}
