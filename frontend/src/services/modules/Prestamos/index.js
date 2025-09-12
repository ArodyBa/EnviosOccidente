import proyecto from "../../api/Proyecto";

// Obtener préstamos de un cliente
export const getPrestamosByCliente = async (id_cliente) => {
  try {
    const response = await proyecto.get(`/prestamos/${id_cliente}/prestamos`);
    return response.data; // Retorna los préstamos del cliente
  } catch (error) {
    console.error("Error al obtener los préstamos del cliente:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al obtener los préstamos" };
  }
};

// Obtener cuotas de un préstamo
export const getCuotasByPrestamo = async (id_prestamo) => {
  try {
    const response = await proyecto.get(`/prestamos/${id_prestamo}/cuotas`);
    return response.data; // Retorna las cuotas del préstamo
  } catch (error) {
    console.error("Error al obtener las cuotas del préstamo:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al obtener las cuotas" };
  }
};

// Registrar un nuevo préstamo
export const registrarPrestamo = async (prestamo) => {
  try {
    const response = await proyecto.post(`/prestamos`, prestamo);
    return response.data; // Retorna el resultado del registro
  } catch (error) {
    console.error("Error al registrar préstamo:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al registrar préstamo" };
  }
};

// Registrar pago de una cuota
export const registrarPagoCuota = async (id_cuota) => {
  try {
    const response = await proyecto.post(`/prestamos/pagar`, { id_cuota });
    return response.data; // Retorna el resultado del pago
  } catch (error) {
    console.error("Error al registrar el pago de la cuota:", error.response?.data || error.message);
    throw error.response?.data || { message: "Error al registrar el pago de la cuota" };
  }
};
export const getClientePorDPI = async (dpi) => {
    try {
      const response = await proyecto.get(`/clientes/${dpi}`);
      return response.data; // Retorna el cliente encontrado
    } catch (error) {
      console.error("Error al obtener cliente por DPI:", error.response?.data || error.message);
      throw error.response?.data || { message: "Cliente no encontrado" };
    }
  };