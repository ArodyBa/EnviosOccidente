const { Router } = require('express');
const ctrl = require('../controllers/menusController');

const router = Router();

router.get('/', ctrl.list);

module.exports = router;

