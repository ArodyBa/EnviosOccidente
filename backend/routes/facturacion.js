// routes/facturacion.js
const express = require('express');
const router = express.Router();
const facturacionController = require('../controllers/facturacionController');

router.post('/fel', facturacionController.emitirFel);

module.exports = router;
