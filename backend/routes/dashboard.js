const { Router } = require('express');
const ctrl = require('../controllers/dashboardController');

const router = Router();

router.get('/overview', ctrl.overview);

module.exports = router;

