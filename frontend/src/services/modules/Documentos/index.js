import proyecto from "../../api/Proyecto"; // respeta la P si el archivo se llama Proyecto.js

const base = "/tipo-documentos"; // <-- UNIFICADO

export const getDocumento = async () => {
  const { data } = await proyecto.get(base);
  return data;
};

export const insertarDocumento = async (doc) => {
  const { data } = await proyecto.post(base, doc);
  return data;
};

export const actualizarDocumento = async ({ id, ...rest }) => {
  const { data } = await proyecto.put(`${base}/${id}`, rest);
  return data;
};

export const eliminarDocumento = async (id) => {
  const { data } = await proyecto.delete(`${base}/${id}`);
  return data;
};
