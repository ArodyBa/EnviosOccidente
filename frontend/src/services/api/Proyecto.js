// src/services/api/Proyecto.js
import axios from "axios";

const proyecto = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000", // ajusta el puerto si tu API va en 5001
  headers: { "Content-Type": "application/json" },
  // withCredentials: true, // habilítalo solo si tu backend usa cookies
});

/** Helper para setear/quitar Authorization: Bearer ... en el cliente axios */
export const setAuthHeader = (token) => {
  if (token) {
    proyecto.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete proyecto.defaults.headers.common.Authorization;
  }
};

// Alias opcional por si en algún lugar lo llamaste setAuthToken
export const setAuthToken = setAuthHeader;

// Asegura el header al arrancar (por si recargas y el Context aún no montó)
(() => {
  const token = localStorage.getItem("accessToken");
  if (token) setAuthHeader(token);
})();

// ------- Interceptor de request: si no hay header, lo toma del storage -------
proyecto.interceptors.request.use(
  (config) => {
    if (!config.headers.Authorization) {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------- Interceptor de response: refresh en 401 y reintento seguro -------
let isRefreshing = false;
let queue = [];
const flushQueue = (err, token = null) => {
  queue.forEach((p) => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

proyecto.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const original = error.config;

    // Solo manejamos 401 de accesos protegidos (evita loop)
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;

      // Si ya hay un refresh en curso, espera el resultado y reintenta
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (newToken) => {
              original.headers.Authorization = `Bearer ${newToken}`;
              resolve(proyecto(original));
            },
            reject,
          });
        });
      }

      // Lanzamos el refresh
      isRefreshing = true;
      try {
        const stored = JSON.parse(localStorage.getItem("auth") || "null");
        const refreshToken = stored?.refreshToken || localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No hay refreshToken");

        const { data } = await proyecto.post("/auth/refresh", { refreshToken });
        const newAccess = data?.accessToken;
        if (!newAccess) throw new Error("No se recibió accessToken");

        // Persistimos y seteamos el nuevo access token
        const nextAuth = stored ? { ...stored, accessToken: newAccess } : null;
        if (nextAuth) localStorage.setItem("auth", JSON.stringify(nextAuth));
        localStorage.setItem("accessToken", newAccess);
        setAuthHeader(newAccess);

        flushQueue(null, newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return proyecto(original);
      } catch (e) {
        flushQueue(e, null);
        // Limpieza y forzar login
        localStorage.removeItem("auth");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAuthHeader(null);
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default proyecto;
