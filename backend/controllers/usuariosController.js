const bcrypt = require('bcryptjs');
const db = require('../config/db');

function asInt(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function uniqueInts(arr) {
  const set = new Set();
  for (const v of Array.isArray(arr) ? arr : []) {
    const n = asInt(v);
    if (n) set.add(n);
  }
  return [...set.values()];
}

exports.list = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.usuario, u.password AS correo, u.estado,
              r.id AS role_id, r.nombre AS role_nombre
       FROM usuarios u
       LEFT JOIN usuario_rol ur ON ur.id_usuario=u.id
       LEFT JOIN roles r ON r.id=ur.id_rol
       ORDER BY u.id, r.nombre`
    );

    const byId = new Map();
    for (const row of rows) {
      if (!byId.has(row.id)) {
        byId.set(row.id, {
          id: row.id,
          usuario: row.usuario,
          correo: row.correo || null,
          estado: row.estado,
          roles: [],
        });
      }
      if (row.role_id) {
        byId.get(row.id).roles.push({ id: row.role_id, nombre: row.role_nombre });
      }
    }

    return res.json([...byId.values()]);
  } catch (e) {
    console.error('usuarios list error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.create = async (req, res) => {
  const usuario = String(req.body?.usuario || '').trim();
  const correo = String(req.body?.correo || '').trim();
  const password = String(req.body?.password || '');
  const estado = req.body?.estado === undefined ? 1 : asInt(req.body?.estado);
  const roleIds = uniqueInts(req.body?.roles);

  if (!usuario || !password) {
    return res.status(400).json({ message: 'usuario y password requeridos' });
  }
  if (estado !== 0 && estado !== 1) {
    return res.status(400).json({ message: 'estado inválido' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      `INSERT INTO usuarios (usuario, password, hash_password, estado)
       VALUES (?,?,?,?)
      `,
      [usuario, correo || null, hash, estado]
    );

    const userId = result.insertId;
    if (roleIds.length) {
      const values = roleIds.map((rid) => [userId, rid]);
      await conn.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ?', [values]);
    }

    await conn.commit();
    return res.status(201).json({ id: userId, usuario, correo: correo || null, estado, roles: roleIds });
  } catch (e) {
    if (conn) await conn.rollback();
    if (e && e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Usuario ya existe' });
    }
    console.error('usuarios create error:', e);
    return res.status(500).json({ message: 'Error interno' });
  } finally {
    if (conn) conn.release();
  }
};

exports.update = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'id inválido' });

  const correo = req.body?.correo === undefined ? undefined : String(req.body?.correo || '').trim();
  const password = req.body?.password === undefined ? undefined : String(req.body?.password || '');
  const estado = req.body?.estado === undefined ? undefined : asInt(req.body?.estado);
  const roleIds = req.body?.roles === undefined ? undefined : uniqueInts(req.body?.roles);

  if (estado !== undefined && estado !== 0 && estado !== 1) {
    return res.status(400).json({ message: 'estado inválido' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const fields = [];
    const params = [];
    if (correo !== undefined) {
      fields.push('password=?');
      params.push(correo || null);
    }
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, 10);
      fields.push('hash_password=?');
      params.push(hash);
    }
    if (estado !== undefined) {
      fields.push('estado=?');
      params.push(estado);
    }

    if (fields.length) {
      params.push(id);
      await conn.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id=?`, params);
    }

    if (roleIds !== undefined) {
      await conn.query('DELETE FROM usuario_rol WHERE id_usuario=?', [id]);
      if (roleIds.length) {
        const values = roleIds.map((rid) => [id, rid]);
        await conn.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ?', [values]);
      }
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (e) {
    if (conn) await conn.rollback();
    console.error('usuarios update error:', e);
    return res.status(500).json({ message: 'Error interno' });
  } finally {
    if (conn) conn.release();
  }
};

exports.deactivate = async (req, res) => {
  const id = asInt(req.params.id);
  if (!id) return res.status(400).json({ message: 'id inválido' });

  const meId = asInt(req.user?.sub);
  if (meId && meId === id) {
    return res.status(400).json({ message: 'No puedes desactivar tu propio usuario' });
  }

  try {
    await db.query('UPDATE usuarios SET estado=0 WHERE id=?', [id]);
    return res.json({ ok: true });
  } catch (e) {
    console.error('usuarios deactivate error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

