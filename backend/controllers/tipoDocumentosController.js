// controllers/tipoDocumentosController.js
const db = require('../config/db'); // 👈 pool con promesas

exports.list = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT id_tipo_doc, nombre, descripcion FROM tipo_documento ORDER BY nombre`
  );
  res.json(rows);
};

exports.create = async (req, res) => {
  const { nombre, descripcion } = req.body;
  if (!nombre) return res.status(400).json({ message: 'nombre requerido' });
  const [r] = await db.query(
    `INSERT INTO tipo_documento (nombre, descripcion) VALUES (?, ?)`,
    [nombre, descripcion || null]
  );
  res.json({ id_tipo_doc: r.insertId, message: 'Creado' });
};

exports.update = async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, descripcion } = req.body;
  await db.query(
    `UPDATE tipo_documento SET nombre=?, descripcion=? WHERE id_tipo_doc=?`,
    [nombre, descripcion || null, id]
  );
  res.json({ message: 'Actualizado' });
};

exports.remove = async (req, res) => {
  const id = Number(req.params.id);
  await db.query(`DELETE FROM tipo_documento WHERE id_tipo_doc=?`, [id]);
  res.json({ message: 'Eliminado' });
};
