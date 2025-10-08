const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/enviosController');

// Catálogos
router.get('/tipos', ctrl.getTiposEnvio);
router.post('/tipos', ctrl.createTipoEnvio);
router.get('/tarifas', ctrl.getTarifasEnvio);
router.post('/tarifas', ctrl.createTarifaEnvio);
router.get('/estados', ctrl.getEstadosEnvio);
router.post('/estados', ctrl.createEstadoEnvio);

// Gestión de envíos
router.get('/seguimiento', ctrl.buscarEnvios); // búsqueda por cliente/dpi/código
router.post('/:id/estado', ctrl.agregarEstadoEnvio); // actualizar estado
router.post('/', ctrl.crearEnvio);
router.get('/:id', ctrl.getEnvio);

module.exports = router;
