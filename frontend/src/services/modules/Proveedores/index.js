import proyecto from "../../api/Proyecto";

export const getProveedores = async () => {
  const response = await proyecto.get("/proveedores");
  return response.data;
};

export const insertarProveedor = async (proveedor) => {
  const response = await proyecto.post("/proveedores", proveedor);
  return response.data;
};

export const actualizarProveedor = async (proveedor) => {
  const response = await proyecto.put(`/proveedores/${proveedor.id}`, proveedor);
  return response.data;
};

export const eliminarProveedor = async (id) => {
  const response = await proyecto.delete(`/proveedores/${id}`);
  return response.data;
};
