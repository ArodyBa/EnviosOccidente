const db = require("../config/db");
const pool= require("../config/db")

const registrarPrestamo = async (req, res) => {
    const { dpi, monto, cuotas, interes } = req.body;
  
    try {
      // Llamar al procedimiento almacenado
      const [result] = await pool.query(
        "CALL registrar_prestamo(?, ?, ?, ?)",
        [dpi, monto, cuotas, interes]
      );
  
      res.json({ message: "Préstamo registrado exitosamente" });
    } catch (error) {
      console.error("Error al registrar el préstamo:", error.message, error.stack);
      res.status(500).json({ message: "Error al registrar el préstamo" });
    }
  };
  const getClientes = async (req, res) => {
    try {
      const [clientes] = await pool.query("SELECT * FROM clientes");
      res.json(clientes);
    } catch (error) {
      console.error("Error al obtener los clientes:", error.message);
      res.status(500).json({ message: "Error al obtener los clientes" });
    }
  };
  const getPrestamosByCliente = async (req, res) => {
    const { id_cliente } = req.params; // ID del cliente desde la URL
    try {
      const [prestamos] = await pool.query(
        "SELECT * FROM prestamos WHERE id_cliente = ?",
        [id_cliente]
      );
      res.json(prestamos);
    } catch (error) {
      console.error("Error al obtener los préstamos:", error.message);
      res.status(500).json({ message: "Error al obtener los préstamos" });
    }
  };
  
  const getCuotasByPrestamo = async (req, res) => {
    const { id_prestamo } = req.params; // ID del préstamo desde la URL
    try {
      const [cuotas] = await pool.query(
        "SELECT * FROM cuotas WHERE id_prestamo = ? ORDER BY numero_cuota",
        [id_prestamo]
      );
      res.json(cuotas);
    } catch (error) {
      console.error("Error al obtener las cuotas:", error.message);
      res.status(500).json({ message: "Error al obtener las cuotas" });
    }
  };
  const registrarPagoCuota = async (req, res) => {
    const { id_cuota } = req.body; // ID de la cuota a pagar
    try {
      const [result] = await pool.query("CALL registrar_pago_cuota(?)", [id_cuota]);
      res.json({ message: "Pago registrado exitosamente" });
    } catch (error) {
      console.error("Error al registrar el pago:", error.message);
      res.status(500).json({ message: "Error al registrar el pago" });
    }
  };
  
  module.exports = {
    registrarPrestamo,registrarPagoCuota,getCuotasByPrestamo,getPrestamosByCliente,getClientes // Exporta el método
  };