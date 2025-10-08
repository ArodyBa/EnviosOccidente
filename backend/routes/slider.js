const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sliderController');

router.get('/', ctrl.listAll);      // protegido por verifyJWT en server
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;

