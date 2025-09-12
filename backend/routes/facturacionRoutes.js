/**
 * Rutas para las operaciones de FEL (Factura Electrónica en Línea)
 */

const express = require('express');
const router = express.Router();
const felController = require('../controllers/facturacionController');

/**
 * @route POST /api/fel/certificar
 * @desc Certificar un documento FEL
 * @access Private
 */
router.post('/certificar', felController.certificarDocumento);

/**
 * @route POST /api/fel/generar-xml
 * @desc Generar un XML FEL sin enviarlo a certificar
 * @access Private
 */
router.post('/generar-xml', felController.generarXml);

/**
 * @route POST /api/fel/validar-xml
 * @desc Validar la estructura de un XML FEL
 * @access Private
 */
router.post('/validar-xml', felController.validarXml);

/**
 * @route POST /api/fel/certificar
 * @desc Certificar un documento FEL
 * @access Private
 */
router.post('/anularFactura', felController.anularDocumento);


module.exports = router;