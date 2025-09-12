const { pool } = require('../config/db');

// 🔍 Buscar serie por su texto (ignorando mayúsculas/minúsculas)
const buscarSerie = async (req, res) => {
  const { serie } = req.params;
  try {
    const [rows] = await pool.promise().query(
      `SELECT s.id, s.serie, s.estado, p.id_producto, p.descripcion 
       FROM series_compra s
       INNER JOIN productos p ON s.id_producto = p.id_producto
       WHERE LOWER(s.serie) = LOWER(?)`, // <-- corrección aquí
      [serie]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Serie no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al buscar serie:", error);
    res.status(500).json({ message: "Error al buscar serie" });
  }
};

// 📄 Obtener todas las series de una compra
const obtenerSeriesPorCompra = async (req, res) => {
  const { id_compra } = req.params;
  const conn = await pool.promise().getConnection();

  try {
    const [series] = await conn.query(
      `SELECT id, serie, id_producto, estado FROM series_compra WHERE serie = ?`,
      [id_compra]
    );
    res.json(series);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener series', error: err.message });
  } finally {
    conn.release();
  }
};

// ✏️ Editar una serie por ID
const editarSerieCompra = async (req, res) => {
  const { id } = req.params;
  const { nuevaSerie } = req.body;
  const conn = await pool.promise().getConnection();

  try {
    await conn.query(
      `UPDATE series_compra SET serie = ? WHERE serie = ?`,
      [nuevaSerie, id]
    );
    res.json({ message: 'Serie actualizada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al editar serie', error: err.message });
  } finally {
    conn.release();
  }
};

// 🗑️ Eliminar una serie y actualizar el stock
const eliminarSerieCompra = async (req, res) => {
  const { id } = req.params;
  const conn = await pool.promise().getConnection();

  try {
    const [serieData] = await conn.query(`SELECT id_producto FROM series_compra WHERE id = ?`, [id]);
    if (serieData.length > 0) {
      const { id_producto } = serieData[0];
      await conn.beginTransaction();

      await conn.query(`DELETE FROM series_compra WHERE id = ?`, [id]);
      await conn.query(`UPDATE productos SET cantidad_inicial = cantidad_inicial - 1 WHERE id_producto = ?`, [id_producto]);

      await conn.commit();
      res.json({ message: 'Serie eliminada y stock actualizado' });
    } else {
      res.status(404).json({ message: 'Serie no encontrada' });
    }
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Error al eliminar serie', error: err.message });
  } finally {
    conn.release();
  }
};

// 🧩 Validación extra si deseas evitar duplicados al actualizar
const actualizarSerie = async (req, res) => {
  const { id } = req.params; // <-- corregido de id_serie a id
  const { nuevaSerie } = req.body;

  try {
    const [existente] = await pool.promise().query(
      `SELECT * FROM series_compra WHERE LOWER(serie) = LOWER(?)`, [nuevaSerie]
    );
    if (existente.length > 0) {
      return res.status(400).json({ message: "Esa serie ya existe" });
    }

    await pool.promise().query(
      `UPDATE series_compra SET serie = ? WHERE id = ?`, // <-- corregido
      [nuevaSerie, id]
    );

    res.json({ message: "Serie actualizada exitosamente" });
  } catch (error) {
    console.error("Error al actualizar serie:", error);
    res.status(500).json({ message: "Error al actualizar la serie" });
  }
};
const getSeriesDetallePorCompra = async (req, res) => {
  const { id_compra } = req.params;

  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        s.id,
        s.serie,
        s.estado,
        p.descripcion
      FROM series_compra s
      INNER JOIN productos p ON s.id_producto = p.id_producto
      WHERE s.id_compra = ?
      ORDER BY p.descripcion, s.serie
    `, [id_compra]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener detalle de series:", error.message);
    res.status(500).json({ message: "Error al obtener detalle de series", error: error.message });
  }
};

// Exportar todos
module.exports = {
  obtenerSeriesPorCompra,
  editarSerieCompra,
  eliminarSerieCompra,
  buscarSerie,
  actualizarSerie,getSeriesDetallePorCompra
};
