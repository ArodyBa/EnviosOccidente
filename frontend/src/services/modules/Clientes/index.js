import proyecto from "../../api/Proyecto";

// Obtener todos los clientes
export const getClientes = async () => {
  try {
    const response = await proyecto.get("/clientes");
    return response.data; // Retorna la lista de clientes
  } catch (error) {
    console.error("Error al obtener clientes:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al obtener clientes" };
  }
};


// Insertar un nuevo cliente
export const insertarCliente = async (cliente) => {
  try {
    const response = await proyecto.post("/clientes", cliente);
    return response.data; // Retorna el cliente insertado
  } catch (error) {
    console.error("Error al insertar cliente:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al insertar cliente" };
  }
};

// Actualizar un cliente
export const actualizarCliente = async (cliente) => {
  try {
    const response = await proyecto.put(`/clientes/${cliente.id}`, cliente);
    return response.data; // Retorna el cliente actualizado
  } catch (error) {
    console.error("Error al actualizar cliente:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al actualizar cliente" };
  }
};


// Eliminar un cliente
export const eliminarCliente = async (id) => {
  try {
    const response = await proyecto.delete(`/clientes/${id}`);
    return response.data; // Retorna la confirmación de eliminación
  } catch (error) {
    console.error("Error al eliminar cliente:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al eliminar cliente" };
  }
};
export const getTiposDocumentos = async () => {
  const response = await proyecto.get("/tipos-documentos");
  return response.data;
};