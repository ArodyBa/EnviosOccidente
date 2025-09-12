const express = require('express');
const router = express.Router();
const facturasController = require('../controllers/facturasController');

router.get('/', facturasController.getFacturas);

module.exports = router;
