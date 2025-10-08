// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import proyecto, { setAuthHeader } from "../services/api/Proyecto"; // axios + helper

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);   // { id, usuario, correo }
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Login: guarda tokens + perfil + roles + menús, y setea Authorization
  const login = async (usuario, password) => {
    const { data } = await proyecto.post("/auth/login", { usuario, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setAuthHeader(data.accessToken);          // Bearer en axios
    setAccessToken(data.accessToken);         // estado del contexto
    setUser(data.perfil || null);
    setRoles(data.roles || []);
setMenus(data?.menus || []);   // 👈 importante

    return true;
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAuthHeader(null);                      // limpia Authorization
    setAccessToken(null);
    setUser(null);
    setRoles([]);
    setMenus([]);
  };

  // Carga inicial: si hay token, setea header y valida /auth/me
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          setAuthHeader(token);
          setAccessToken(token);
          const { data } = await proyecto.get("/auth/me");
          setUser(data?.perfil || null);
          setRoles(data?.roles || []);
                setMenus(data?.menus || []); // 👈 importante

          // menús suelen venir en /auth/login; si necesitas, podrías recargarlos aquí
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = { accessToken, user, roles, menus, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
