const express = require("express");
const router = express.Router();
const prestamosController = require("../controllers/prestamosController");

// Crear un nuevo préstamo
router.post("/", prestamosController.registrarPrestamo);

// Obtener todos los clientes
router.get("/clientes", prestamosController.getClientes);

// Obtener préstamos de un cliente específico
router.get("/:id_cliente/prestamos", prestamosController.getPrestamosByCliente);

// Obtener cuotas de un préstamo específico
router.get("/:id_prestamo/cuotas", prestamosController.getCuotasByPrestamo);

// Registrar el pago de una cuota específica
router.post("/pagar", prestamosController.registrarPagoCuota);

module.exports = router;
