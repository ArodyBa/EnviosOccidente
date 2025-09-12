const path = require('path');
const fs = require('fs/promises');
const { promisePool } = require('../config/db');

exports.upsert = async (req, res) => {
  const { id_cliente, id_tipo_doc, nombre_documento, fecha_vencimiento, fecha_carga, archivo } = req.body;

  if (!id_cliente || !id_tipo_doc) {
    return res.status(400).json({ message: 'id_cliente e id_tipo_doc son obligatorios' });
  }

  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();

    // ¿Existe ya papelería para (cliente, tipo_doc)?
    const [exists] = await conn.query(
      `SELECT id_papeleria, storage_path
         FROM papeleria
        WHERE id_cliente=? AND id_tipo_doc=?
        FOR UPDATE`,
      [id_cliente, id_tipo_doc]
    );

    // Si llegó un archivo nuevo, usaremos estos campos
    const hasNewFile = archivo && archivo.url;
    const newUrl  = hasNewFile ? archivo.url : null;
    const newPath = hasNewFile ? (archivo.relative_path || null) : null;

    if (exists.length) {
      const prev = exists[0];

      // Si hay archivo nuevo y había uno previo → borrar físico anterior
      if (hasNewFile && prev.storage_path) {
        try {
          const abs = path.join(process.cwd(), prev.storage_path);
          await fs.unlink(abs);
        } catch (_) {
          // si no existe, lo ignoramos
        }
      }

      // Construir SET dinámico
      const sets = [];
      const vals = [];

      // nombre_documento
      if (typeof nombre_documento === 'string') {
        sets.push('nombre_documento=?'); vals.push(nombre_documento);
      }

      // fecha_vencimiento
      if (fecha_vencimiento === '' || fecha_vencimiento === null) {
        sets.push('fecha_vencimiento=NULL');
      } else if (typeof fecha_vencimiento === 'string') {
        sets.push('fecha_vencimiento=?'); vals.push(fecha_vencimiento);
      }

      // fecha_carga
      if (fecha_carga) { sets.push('fecha_carga=?'); vals.push(fecha_carga); }

      // archivo nuevo
      if (hasNewFile) {
        sets.push('documento_url=?'); vals.push(newUrl);
        sets.push('storage_path=?'); vals.push(newPath);
        sets.push('estado=1');
      }

      // siempre toca updated_at
      sets.push('updated_at=NOW()');

      if (sets.length) {
        await conn.query(
          `UPDATE papeleria SET ${sets.join(', ')} WHERE id_papeleria=?`,
          [...vals, prev.id_papeleria]
        );
      }
    } else {
      // No existe → inserta (requiere archivo si quieres marcar estado=1)
      await conn.query(
        `INSERT INTO papeleria
          (id_cliente, id_tipo_doc, nombre_documento, documento_url, storage_path,
           fecha_vencimiento, fecha_carga, estado, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id_cliente,
          id_tipo_doc,
          nombre_documento || (hasNewFile ? archivo.name : 'Documento'),
          hasNewFile ? newUrl : null,
          hasNewFile ? newPath : null,
          fecha_vencimiento || null,
          fecha_carga || new Date(),
          hasNewFile ? 1 : 0
        ]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error('upsert error:', e);
    res.status(500).json({ message: 'Error en papelería' });
  } finally {
    conn.release();
  }  }
exports.listByCliente = async (req, res) => {
  const id_cliente = Number(req.params.id_cliente);
  try {
    const [rows] = await promisePool.query(
      `SELECT p.id_papeleria, p.id_tipo_doc, td.nombre AS tipo_documento,
              p.nombre_documento, p.documento_url, p.storage_path,
              p.fecha_vencimiento, p.fecha_carga, p.estado
         FROM papeleria p
         JOIN tipo_documento td ON td.id_tipo_doc = p.id_tipo_doc
        WHERE p.id_cliente=?
        ORDER BY td.nombre`,
      [id_cliente]
    );
    res.json(rows);
  } catch (e) {
    console.error("Error listByCliente:", e);
    res.status(500).json({ message: 'Error al listar papelería' });
  }
};

exports.deleteItem = async (req, res) => {
  const id_papeleria = Number(req.params.id_papeleria);
  try {
    const [[row]] = await promisePool.query(
      `SELECT storage_path FROM papeleria WHERE id_papeleria=?`,
      [id_papeleria]
    );
    if (!row) return res.status(404).json({ message: 'No encontrado' });

    // Borrar archivo físico si existe
    if (row.storage_path) {
      // relative_path => uploads/AAAA/MM/uuid.ext
      const abs = path.join(process.cwd(), row.storage_path);
      try { await fs.unlink(abs); } catch (_) {}
    }

    await promisePool.query(
      `UPDATE papeleria
          SET documento_url=NULL, storage_path=NULL, estado=0, updated_at=NOW()
        WHERE id_papeleria=?`,
      [id_papeleria]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error("Error deleteItem:", e);
    res.status(500).json({ message: 'Error al eliminar documento' });
  }
};
