import proyecto from "../../api/Proyecto";

export const obtenerRoles = async () => {
  const response = await proyecto.get("/roles");
  return response.data;
};

export const crearRol = async (payload) => {
  const response = await proyecto.post("/roles", payload);
  return response.data;
};

export const obtenerMenusPorRol = async (roleId) => {
  const response = await proyecto.get(`/roles/${roleId}/menus`);
  return response.data;
};

export const guardarMenusPorRol = async (roleId, menuIds) => {
  const response = await proyecto.put(`/roles/${roleId}/menus`, { menuIds });
  return response.data;
};
