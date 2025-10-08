// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, rolesAllowed }) {
  const { accessToken, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;                       // o spinner

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (rolesAllowed?.length) {
    const ok = roles?.some(r => rolesAllowed.includes(r));
    if (!ok) return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
