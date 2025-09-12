import proyecto from "../../api/Proyecto";

export const getCategorias = async () => {
  const res = await proyecto.get("/categorias");
  return res.data;
};

export const insertarCategoria = async (categoria) => {
  const res = await proyecto.post("/categorias", categoria);
  return res.data;
};

export const actualizarCategoria = async (id, categoria) => {
  const res = await proyecto.put(`/categorias/${id}`, categoria);
  return res.data;
};

export const eliminarCategoria = async (id) => {
  const res = await proyecto.delete(`/categorias/${id}`);
  return res.data;
};
