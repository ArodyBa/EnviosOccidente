const router = require('express').Router();
const ctrl = require('../controllers/papeleriaController');

router.post('/upsert', ctrl.upsert);
router.get('/cliente/:id_cliente', ctrl.listByCliente);
router.delete('/item/:id_papeleria', ctrl.deleteItem);

module.exports = router;
