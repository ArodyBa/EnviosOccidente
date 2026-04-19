const { Router } = require('express');
const ctrl = require('../controllers/usuariosController');

const router = Router();

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.deactivate);

module.exports = router;

