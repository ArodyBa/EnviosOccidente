import proyecto from "../../api/Proyecto";

export const registrarAbono = async (abono) => {
  const res = await proyecto.post("/abonos", abono);
  return res.data;
};
