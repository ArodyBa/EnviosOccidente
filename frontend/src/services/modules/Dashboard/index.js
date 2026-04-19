import proyecto from "../../api/Proyecto";

export const obtenerOverview = async () => {
  const response = await proyecto.get("/dashboard/overview");
  return response.data;
};

