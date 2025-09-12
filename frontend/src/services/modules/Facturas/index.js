import proyecto from "../../api/Proyecto";

export const getFacturas = async () => {
  const response = await proyecto.get("/facturas");
  return response.data;
};

export const anularFactura = async (datosFactura) => {
  const response = await proyecto.post(`/facturacion/anularFactura`, datosFactura);
  return response.data;
};

export const anularVenta = async (venta) => {
  const res = await proyecto.post("/ventas/anular-venta", venta);
  return res.data;
};
