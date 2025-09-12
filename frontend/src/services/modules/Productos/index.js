import proyecto from "../../api/Proyecto";

export const getUnidadesMedida = async () => {
  const response = await proyecto.get("/productos/unidades");
  return response.data;
};

export const getTiposPrecio = async () => {
  const response = await proyecto.get("/productos/tipos-precio");
  return response.data;
};

export const insertarProducto = async (producto) => {
  const response = await proyecto.post("/productos", producto);
  return response.data;
};
export const getProductos = async () => {
  const response = await proyecto.get("/productos");
  return response.data;
};