// controllers/ventasController.js
const db = require("../config/db"); // exporta SOLO el promisePool desde config/db.js
// const axios = require("axios"); // <-- quítalo si no lo usas

// ───────── Catálogos ─────────
const getTiposDocumento = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tipos_documento");
    res.json(rows);
  } catch (e) {
    console.error("Error al obtener tipos de documento:", e.message);
    res.status(500).json({ message: "Error al obtener tipos de documento" });
  }
};

const getTiposVenta = async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tipos_venta");
    res.json(rows);
  } catch (e) {
    console.error("Error al obtener tipos de venta:", e.message);
    res.status(500).json({ message: "Error al obtener tipos de venta" });
  }
};

// ───────── Crear venta ─────────
const crearVenta = async (req, res) => {
  const { id_cliente, fecha_venta, tipo_venta, id_moneda, detalles = [] } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [ventaRes] = await conn.query(
      "INSERT INTO ventas (id_cliente, fecha_venta, tipo_venta, id_moneda) VALUES (?, ?, ?, ?)",
      [id_cliente, fecha_venta, tipo_venta, id_moneda]
    );
    const ventaId = ventaRes.insertId;

    let totalVenta = 0;
    const detallesVenta = [];

    for (const item of detalles) {
      const id_producto     = Number(item.id_producto);
      const cantidad        = Number(item.cantidad) || 0;
      const precio_unitario = Number(item.precio_unitario) || 0;
      const total           = Number(item.total ?? cantidad * precio_unitario);
      const series          = Array.isArray(item.series) ? item.series : [];

      if (!series.length || series.length !== cantidad) {
        throw new Error(`Las series para el producto ID ${id_producto} no coinciden con la cantidad`);
      }

      const placeholders = series.map(() => "?").join(",");
      const [chk] = await conn.query(
        `SELECT COUNT(*) AS total
           FROM series_compra
          WHERE id_producto=? AND serie IN (${placeholders}) AND estado=1`,
        [id_producto, ...series]
      );
      if (chk[0].total !== series.length) {
        throw new Error(`Algunas series no existen o ya están vendidas para el producto ID ${id_producto}`);
      }

      await conn.query(
        `INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, total)
         VALUES (?, ?, ?, ?, ?)`,
        [ventaId, id_producto, cantidad, precio_unitario, total]
      );

      await conn.query(
        `UPDATE series_compra SET estado=0, id_venta=?
          WHERE id_producto=? AND serie IN (${placeholders})`,
        [ventaId, id_producto, ...series]
      );

      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial - ? WHERE id_producto = ?",
        [cantidad, id_producto]
      );

      totalVenta += total;
      detallesVenta.push({ id_producto, cantidad, precio_unitario, total, series });
    }

    await conn.query("UPDATE ventas SET total=? WHERE id_venta=?", [totalVenta, ventaId]);

    if (tipo_venta === "Crédito") {
      const [c] = await conn.query("SELECT saldo FROM clientes WHERE id_cliente=?", [id_cliente]);
      const saldoActual = Number(c[0]?.saldo || 0);
      const nuevoSaldo  = saldoActual + totalVenta;

      await conn.query("UPDATE clientes SET saldo=? WHERE id_cliente=?", [nuevoSaldo, id_cliente]);
      await conn.query(
        `INSERT INTO historial_saldos (id_cliente, tipo_movimiento, monto, saldo_resultante, observaciones)
         VALUES (?, 'VENTA_CREDITO', ?, ?, ?)`,
        [id_cliente, totalVenta, nuevoSaldo, `Venta a crédito ID ${ventaId}`]
      );
    }

    const [clienteRow] = await conn.query("SELECT * FROM clientes WHERE id_cliente=?", [id_cliente]);
    await conn.commit();

    res.json({
      message: "Venta registrada exitosamente",
      id_venta: ventaId,
      cliente: clienteRow[0],
      detalles: detallesVenta,
    });
  } catch (e) {
    await conn.rollback();
    console.error("crearVenta error:", e);
    res.status(400).json({ message: e.message || "Error al registrar venta" });
  } finally {
    conn.release();
  }
};

// ───────── Anular venta ─────────
const anularVenta = async (req, res) => {
  const { idVenta } = req.body || {};
  if (!idVenta) return res.status(400).json({ message: "idVenta requerido" });

  // lee listas fuera de la transacción
  const [detalleVentas] = await db.query(
    "SELECT id_producto, cantidad FROM detalle_ventas WHERE id_venta=?",
    [idVenta]
  );
  const [seriesVenta] = await db.query(
    "SELECT id_producto, serie FROM series_compra WHERE id_venta=?",
    [idVenta]
  );

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query("UPDATE ventas SET total=0 WHERE id_venta=?", [idVenta]);

    for (const { id_producto, cantidad } of detalleVentas) {
      await conn.query(
        "UPDATE detalle_ventas SET cantidad=0, precio_unitario=0, total=0 WHERE id_venta=? AND id_producto=?",
        [idVenta, id_producto]
      );
      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial + ? WHERE id_producto=?",
        [cantidad, id_producto]
      );
    }

    for (const { id_producto, serie } of seriesVenta) {
      await conn.query(
        "UPDATE series_compra SET estado=1, id_venta=0 WHERE id_producto=? AND serie=? AND id_venta=?",
        [id_producto, serie, idVenta]
      );
    }

    await conn.commit();
    res.json({ message: "Venta anulada exitosamente", id_venta: idVenta });
  } catch (e) {
    await conn.rollback();
    console.error("anularVenta error:", e);
    res.status(500).json({ message: "Error al anular venta" });
  } finally {
    conn.release();
  }
};

// ───────── Utilidades ─────────
const validarSeries = async (req, res) => {
  const { id_producto, series } = req.body;
  if (!id_producto || !Array.isArray(series)) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }
  try {
    const placeholders = series.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT serie FROM series_compra
        WHERE id_producto=? AND serie IN (${placeholders}) AND estado=0`,
      [id_producto, ...series]
    );
    res.json({ seriesVendidas: rows.map(r => r.serie) });
  } catch (e) {
    console.error("Error al validar series:", e.message);
    res.status(500).json({ message: "Error al validar series" });
  }
};

const getUnidadesPorProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT c.unidad_destino_id AS id, u.nombre, pp.precio,
              COALESCE(SUM(e.stock_actual),0) AS stock
         FROM conversiones_producto c
         JOIN unidades_medida u ON c.unidad_destino_id=u.id
         LEFT JOIN precios_producto pp
           ON pp.producto_id=c.producto_id AND pp.unidad_id=c.unidad_destino_id
         LEFT JOIN existencias_producto e
           ON e.producto_id=c.producto_id AND e.unidad_id=c.unidad_destino_id
        WHERE c.producto_id=?
        GROUP BY c.unidad_destino_id, u.nombre, pp.precio`,
      [id]
    );
    res.json(rows);
  } catch (e) {
    console.error("Error al obtener unidades por producto:", e.message);
    res.status(500).json({ message: "Error al obtener unidades" });
  }
};

module.exports = {
  getTiposDocumento,
  getTiposVenta,
  crearVenta,
  anularVenta,
  validarSeries,
  getUnidadesPorProducto,
};
