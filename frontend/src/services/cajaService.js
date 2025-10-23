// src/services/cajaService.js
import api from './api/Proyecto';

export const CajaAPI = {
  getAperturaActual: (params = {}) => api.get('/caja/apertura-actual', { params }).then(r => r.data),
  abrir: (payload) => api.post('/caja/aperturas', payload).then(r => r.data),
  movimiento: (payload) => api.post('/caja/movimientos', payload).then(r => r.data),
  listarMovimientos: (params = {}) => api.get('/caja/movimientos', { params }).then(r => r.data),
  cerrar: (payload) => api.post('/caja/cierre', payload).then(r => r.data),
  resumen: (params = {}) => api.get('/caja/resumen', { params }).then(r => r.data),
};

export default CajaAPI;

