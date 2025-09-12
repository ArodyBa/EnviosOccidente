const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.getClientes);
router.post('/', clientesController.crearCliente);
router.put('/:id', clientesController.actualizarCliente);
router.delete('/:id', clientesController.eliminarCliente);

// ✅ Ruta específica para evitar conflicto
router.get("/buscar/dpi/:dpi", clientesController.buscarClientePorDPI);

module.exports = router;
