// controllers/auth.controller.js
// Usa el pool con promesas
// Si en config/db.js exportas SOLO el promisePool:  module.exports = promisePool;
// entonces:
const db = require('../config/db');
// Si en config/db.js exportas { pool, promisePool }, usa:
// const { promisePool: db } = require('../config/db');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '60m' });

const signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

// LOGIN (async)
exports.login = async (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ message: 'usuario y password requeridos' });
  }

  try {
    // 👇 ESTE await DEBE ESTAR DENTRO DE ESTA FUNCIÓN async
    const [rows] = await db.query(
      'SELECT id, usuario, password, hash_password, estado FROM usuarios WHERE usuario=? LIMIT 1',
      [usuario]
    );
    if (!rows.length || rows[0].estado !== 1) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const u = rows[0];

    const ok = await bcrypt.compare(password, u.hash_password);
    if (!ok) return res.status(401).json({ message: 'Credenciales inválidas' });

    // Roles
    const [rolesRows] = await db.query(
      `SELECT r.nombre FROM roles r
       JOIN usuario_rol ur ON ur.id_rol=r.id
       WHERE ur.id_usuario=?`,
      [u.id]
    );
    const roles = rolesRows.map(r => r.nombre);

    // Menús (incluye grupo, icono y orden si los tienes en la BD)
    const [menus] = await db.query(
      `SELECT DISTINCT m.id, m.nombre, m.ruta, m.icono, m.orden, m.grupo
       FROM menus m
       JOIN rol_menu rm ON rm.id_menu=m.id
       JOIN usuario_rol ur ON ur.id_rol=rm.id_rol
       WHERE ur.id_usuario=? AND m.activo=1
       ORDER BY m.orden`,
      [u.id]
    );

    const payload = { sub: u.id, usuario: u.usuario, roles };
    const accessToken = signAccess(payload);
    const refreshToken = signRefresh({ sub: u.id });

    return res.json({
      accessToken,
      refreshToken,
      perfil: { id: u.id, usuario: u.usuario, correo: u.correo },
      roles,
      menus
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Error en login' });
  }
};

// REFRESH (no necesita async si no haces awaits)
exports.refresh = (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken requerido' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = signAccess({ sub: decoded.sub });
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'refresh token inválido/expirado' });
  }
};

// ME (async)// ME (async) — devuelve perfil, roles y MENUS
exports.me = async (req, res) => {
  try {
    const userId = req.user?.sub;

    const [perfilRows] = await db.query(
      'SELECT id, usuario, password FROM usuarios WHERE id=? LIMIT 1',
      [userId]
    );
    if (!perfilRows.length) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const [rolesRows] = await db.query(
      `SELECT r.nombre FROM roles r
       JOIN usuario_rol ur ON ur.id_rol=r.id
       WHERE ur.id_usuario=?`,
      [userId]
    );
    const roles = rolesRows.map(r => r.nombre);

    const [menus] = await db.query(
      `SELECT DISTINCT m.id, m.nombre, m.ruta, m.icono, m.orden, m.grupo
       FROM menus m
       JOIN rol_menu rm ON rm.id_menu=m.id
       JOIN usuario_rol ur ON ur.id_rol=rm.id_rol
       WHERE ur.id_usuario=? AND m.activo=1
       ORDER BY m.orden`,
      [userId]
    );

    return res.json({
      perfil: perfilRows[0],
      roles,
      menus
    });
  } catch (e) {
    console.error('me error:', e);
    return res.status(500).json({ message: 'Error al obtener perfil' });
  }
};
