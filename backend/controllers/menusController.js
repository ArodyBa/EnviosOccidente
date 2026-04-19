const db = require('../config/db');

exports.list = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, nombre, ruta, icono, orden, grupo, activo
       FROM menus
       ORDER BY COALESCE(grupo,''), COALESCE(orden,0), nombre`
    );
    return res.json(rows);
  } catch (e) {
    console.error('menus list error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

