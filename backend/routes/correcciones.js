const express = require('express');
const router = express.Router();
const controller = require('../controllers/correccionesController');

router.get('/series-por-compra/:id_compra', controller.obtenerSeriesPorCompra);
router.put('/editar-serie/:id', controller.editarSerieCompra);
router.delete('/eliminar-serie/:id', controller.eliminarSerieCompra);
router.get("/series/:serie", controller.buscarSerie); // ✅ corrección aquí
router.get('/detalle-series/:id_compra', controller.getSeriesDetallePorCompra);

module.exports = router;
