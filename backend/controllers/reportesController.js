const { pool } = require('../config/db');

const movimientosPorFecha = async (req, res) => {
  const { fecha } = req.query;
  const conn = await pool.promise().getConnection();

  try {
    // Ventas
    const [ventas] = await conn.query(`
      SELECT v.id_venta AS id, v.fecha_venta AS fecha, c.nombre AS cliente, v.total AS monto, 'VENTA' AS tipo
      FROM ventas v
      INNER JOIN clientes c ON v.id_cliente = c.id_cliente
      WHERE DATE(v.fecha_venta) = ?
    `, [fecha]);

    // Abonos
    const [abonos] = await conn.query(`
      SELECT h.id_historial AS id, h.fecha, c.nombre AS cliente, h.monto, 'ABONO' AS tipo
      FROM historial_saldos h
      INNER JOIN clientes c ON h.id_cliente = c.id_cliente
      WHERE DATE(h.fecha) = ? AND h.tipo_movimiento = 'ABONO'
    `, [fecha]);

    const movimientos = [...ventas, ...abonos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const total_ventas = ventas.reduce((sum, v) => sum + Number(v.monto), 0);
    const total_abonos = abonos.reduce((sum, a) => sum + Number(a.monto), 0);

    res.json({ movimientos, total_ventas, total_abonos });

  } catch (error) {
    console.error("Error al obtener movimientos:", error.message);
    res.status(500).json({ message: "Error al obtener movimientos", error: error.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  movimientosPorFecha,
};
