const { Router } = require('express');
const ctrl = require('../controllers/rolesController');

const router = Router();

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id/menus', ctrl.getMenus);
router.put('/:id/menus', ctrl.setMenus);

module.exports = router;
