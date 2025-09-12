import axios from "axios";

const proyecto = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5001", // Cambiar si la API está en otro lugar
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token de autenticación
proyecto.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Si utilizas un token JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default proyecto;
