const { Router } = require('express');
const { login, refresh, me } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middlewares/auth.middleware');

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', verifyJWT, me);

module.exports = router;
