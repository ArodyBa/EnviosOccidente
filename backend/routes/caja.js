const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cajaController');

router.get('/apertura-actual', ctrl.getAperturaActual);
router.post('/aperturas', ctrl.abrirCaja);
router.post('/movimientos', ctrl.crearMovimiento);
router.get('/movimientos', ctrl.listarMovimientos);
router.post('/cierre', ctrl.cerrarCaja);
router.get('/resumen', ctrl.resumen);

module.exports = router;

