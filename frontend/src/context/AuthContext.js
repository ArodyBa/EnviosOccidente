import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto
export const AuthContext = createContext();

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para iniciar sesión
  const login = (pin) => {
    const validPin = 'AGOP@GT'; // Cambia esto al PIN válido
    if (pin.trim() === validPin) { // Asegúrate de que el PIN sea exacto
      const userData = { pin, isAuthenticated: true };
      setUser(userData);
      localStorage.setItem('auth', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('auth');
    console.log('Usuario en localStorage:', storedUser); // Verifica qué se guarda
  
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};
