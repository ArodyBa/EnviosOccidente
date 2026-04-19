import proyecto from "../api/Proyecto";

export const obtenerUsuarios = async () => {
  const response = await proyecto.get("/usuarios");
  return response.data;
};

export const crearUsuario = async (payload) => {
  const response = await proyecto.post("/usuarios", payload);
  return response.data;
};

export const actualizarUsuario = async (id, payload) => {
  const response = await proyecto.put(`/usuarios/${id}`, payload);
  return response.data;
};

export const eliminarUsuario = async (id) => {
  const response = await proyecto.delete(`/usuarios/${id}`);
  return response.data;
};

// Compat: por si alguien lo usaba como default import
const UsuariosService = { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario };
export default UsuariosService;
