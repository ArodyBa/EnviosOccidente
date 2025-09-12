import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('Estado de loading:', loading); // Verifica si el estado cambia correctamente
  console.log('Usuario:', user); // Verifica el estado de user

  if (loading) return <p>Cargando...</p>;

  return user?.isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;