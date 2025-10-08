const db = require('../config/db');

// Público: lista solo activos ordenados
const listPublic = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT id_slider, titulo, descripcion, url FROM slider_images WHERE activo=1 ORDER BY orden, id_slider`);
    res.json(rows);
  } catch (e) {
    console.error('slider.listPublic:', e.message);
    res.status(500).json({ message: 'Error al obtener slider' });
  }
};

// Admin: listar todo
const listAll = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM slider_images ORDER BY orden, id_slider`);
    res.json(rows);
  } catch (e) {
    console.error('slider.listAll:', e.message);
    res.status(500).json({ message: 'Error al obtener slider' });
  }
};

const create = async (req, res) => {
  try {
    const { titulo, descripcion, url, orden } = req.body || {};
    if (!url) return res.status(400).json({ message: 'url es requerido' });
    const [r] = await db.query(
      `INSERT INTO slider_images (titulo, descripcion, url, orden) VALUES (?,?,?,?)`,
      [titulo || null, descripcion || null, url, Number(orden) || 1]
    );
    res.status(201).json({ id_slider: r.insertId });
  } catch (e) {
    console.error('slider.create:', e.message);
    res.status(500).json({ message: 'Error al crear slide' });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id inválido' });
    const { titulo, descripcion, url, orden, activo } = req.body || {};
    await db.query(
      `UPDATE slider_images SET
        titulo = COALESCE(?, titulo),
        descripcion = COALESCE(?, descripcion),
        url = COALESCE(?, url),
        orden = COALESCE(?, orden),
        activo = CASE WHEN ? IS NULL THEN activo ELSE (?<>0) END
       WHERE id_slider=?`,
      [titulo ?? null, descripcion ?? null, url ?? null, orden ?? null, activo, activo, id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('slider.update:', e.message);
    res.status(500).json({ message: 'Error al actualizar slide' });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'id inválido' });
    await db.query(`DELETE FROM slider_images WHERE id_slider=?`, [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('slider.remove:', e.message);
    res.status(500).json({ message: 'Error al eliminar slide' });
  }
};

module.exports = { listPublic, listAll, create, update, remove };

