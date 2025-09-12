import proyecto from "../../api/Proyecto";

// Obtener series por ID de compra
export const getSeriesPorCompra = async (idCompra) => {
  const res = await proyecto.get(`/correcciones/series-por-compra/${idCompra}`);
  return res.data;
};

// Editar una serie
export const editarSerie = async (id, nuevaSerie) => {
  const res = await proyecto.put(`/correcciones/editar-serie/${id}`, { nuevaSerie });
  return res.data;
};

// Eliminar una serie
export const eliminarSerie = async (id) => {
  const res = await proyecto.delete(`/correcciones/eliminar-serie/${id}`);
  return res.data;
};
export const validarSeries = async (id_producto, series) => {
  const res = await proyecto.post("/series/validar", { id_producto, series });
  return res.data;
};

export const buscarSerie = async (serieBuscada) => {
  const res = await proyecto.get(`/correcciones/series/${serieBuscada}`);
  return res.data;
};

export const getResumenComprasConSeries = async () => {
  const res = await proyecto.get('/correcciones/compras-con-series');
  return res.data;
};

export const getSeriesDetallePorCompra = async (idCompra) => {
  const res = await proyecto.get(`/correcciones/detalle-series/${idCompra}`);
  return res.data;
};
export const getReporteComprasPorFecha = async (desde, hasta) => {
  const res = await proyecto.get(`/correcciones/reporte-compras?desde=${desde}&hasta=${hasta}`);
  return res.data;
};

