// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import CajaAPI from '../services/cajaService';

export default function ProtectedRoute({ children, rolesAllowed }) {
  const { accessToken, roles, loading } = useAuth();
  const location = useLocation();
  const [cajaLoading, setCajaLoading] = useState(true);
  const [cajaAbierta, setCajaAbierta] = useState(true);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      if (!accessToken) { setCajaLoading(false); return; }
      try {
        const data = await CajaAPI.getAperturaActual();
        if (!alive) return;
        setCajaAbierta(!!data?.abierta);
      } catch (_) {
        // En caso de fallo del endpoint, no bloqueamos
        setCajaAbierta(true);
      } finally { if (alive) setCajaLoading(false); }
    };
    check();
    return () => { alive = false; };
  }, [accessToken, location.pathname]);

  if (loading) return null;                       // o spinner

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (rolesAllowed?.length) {
    const ok = roles?.some(r => rolesAllowed.includes(r));
    if (!ok) return <Navigate to="/no-autorizado" replace />;
  }

  // Exigir apertura de caja para navegar, excepto en la pantalla de Caja
  if (!cajaLoading && !cajaAbierta && location.pathname !== '/caja') {
    return <Navigate to="/caja" replace state={{ from: location }} />;
  }

  return children;
}
