// services/modules/Ventas.js
import proyecto from "../../api/Proyecto";

export const insertarVenta = async (venta) => {
  const res = await proyecto.post("/ventas", venta);
  return res.data;
};

export const getTiposDocumento = async () => {
  const res = await proyecto.get("/ventas/tipos-documento");
  return res.data;
};

export const getTiposVenta = async () => {
  const res = await proyecto.get("/ventas/tipos-venta");
  return res.data;

};
// services/modules/Ventas.js
export const getUnidadesPorProducto = async (productoId) => {
  const res = await proyecto.get(`/productos/unidades/${productoId}`); // ✅ esta es la correcta
  return res.data;
};
// services/modules/Series.js

export const validarSeries = async (id_producto, series) => {
  const res = await proyecto.post("/series/validar", { id_producto, series });
  return res.data;
};

export const GenerarFactura = async (venta) => {
  const res = await proyecto.post("/facturacion/certificar", venta);
  return res.data;
};
