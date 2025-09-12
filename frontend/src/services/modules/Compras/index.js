import proyecto from "../../api/Proyecto";

// Obtener lista de proveedores
export const getProveedores = async () => {
  const res = await proyecto.get("/proveedores");
  return res.data;
};

// Obtener lista de productos
export const getProductos = async () => {
    const res = await proyecto.get("/productos/con-series");
    return res.data;
  };
// Obtener lista de unidades de medida
export const getUnidadesMedida = async () => {
  const res = await proyecto.get("/productos/unidades");
  return res.data;
};

// Insertar una nueva compra con sus detalles
export const insertarCompra = async (compra) => {
  const res = await proyecto.post("/compras", compra);
  return res.data;
};
export const getSeriesDetallePorCompra = async (idCompra) => {
  const res = await proyecto.get(`/correcciones/detalle-series/${idCompra}`);
  return res.data;
};
