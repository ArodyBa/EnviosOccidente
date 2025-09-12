import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Obtener reporte combinado de ventas y abonos por fecha
 * @param {string} fecha - en formato YYYY-MM-DD
 */
export const getMovimientosPorFecha = async (fecha) => {
  const res = await axios.get(`${API_URL}/reportes/movimientos`, {
    params: { fecha },
  });
  return res.data;
};
