const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportesController');

router.get('/movimientos', controller.movimientosPorFecha);

module.exports = router;