const db = require('../config/db');

exports.list = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre FROM roles ORDER BY nombre');
    return res.json(rows);
  } catch (e) {
    console.error('roles list error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.create = async (req, res) => {
  try {
    const nombre = String(req.body?.nombre || '').trim();
    if (!nombre) return res.status(400).json({ message: 'nombre requerido' });

    const [result] = await db.query('INSERT INTO roles (nombre) VALUES (?)', [nombre]);
    return res.status(201).json({ id: result.insertId, nombre });
  } catch (e) {
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Rol ya existe' });
    }
    console.error('roles create error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.getMenus = async (req, res) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isFinite(roleId) || roleId <= 0) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const [rows] = await db.query('SELECT id_menu FROM rol_menu WHERE id_rol=?', [roleId]);
    return res.json(rows.map((r) => r.id_menu));
  } catch (e) {
    console.error('roles getMenus error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.setMenus = async (req, res) => {
  const roleId = Number(req.params.id);
  if (!Number.isFinite(roleId) || roleId <= 0) {
    return res.status(400).json({ message: 'id inválido' });
  }

  const menuIdsRaw = Array.isArray(req.body?.menuIds) ? req.body.menuIds : [];
  const menuIds = [...new Set(menuIdsRaw.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0))];

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    await conn.query('DELETE FROM rol_menu WHERE id_rol=?', [roleId]);
    if (menuIds.length) {
      const values = menuIds.map((mid) => [roleId, mid]);
      await conn.query('INSERT INTO rol_menu (id_rol, id_menu) VALUES ?', [values]);
    }

    await conn.commit();
    return res.json({ ok: true, id_rol: roleId, menuIds });
  } catch (e) {
    if (conn) await conn.rollback();
    console.error('roles setMenus error:', e);
    return res.status(500).json({ message: 'Error interno' });
  } finally {
    if (conn) conn.release();
  }
};
