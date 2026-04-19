import proyecto from "../../api/Proyecto";

export const obtenerMenus = async () => {
  const response = await proyecto.get("/menus");
  return response.data;
};

