const jwt = require('jsonwebtoken');
const config = require('../config/environment');

function verifyJWT(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    req.user = jwt.verify(token, config.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = { verifyJWT };
