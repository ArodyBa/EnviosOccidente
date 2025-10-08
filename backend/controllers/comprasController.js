// controllers/comprasController.js
const db = require('../config/db'); // <- promisePool exportado por config/db.js

// POST /compras
const crearCompra = async (req, res) => {
  const { fecha, no_factura_compra, id_proveedor, detalles } = req.body;

  let conn;
  try {
    conn = await db.getConnection();         // 👈 NO uses pool.promise()
    await conn.beginTransaction();

    const [compraRes] = await conn.query(
      `INSERT INTO compras (fecha, no_factura_compra, id_proveedor)
       VALUES (?, ?, ?)`,
      [fecha, no_factura_compra, id_proveedor]
    );
    const compraId = compraRes.insertId;

    for (const item of (detalles || [])) {
      const cantidad   = Number(item.cantidad) || 0;
      const costo      = Number(item.precio_unitario) || 0; // costo de compra
      const precioVent = Number(item.precio_venta) || 0;

      // detalle compra
      await conn.query(
        `INSERT INTO detalle_compras 
         (id_compra, id_producto, cantidad_compra, descripcion, precio_unitario_compra, total_compra, precio_venta, caducidad) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          compraId,
          item.id_producto,
          cantidad,
          item.descripcion || null,
          costo,
          cantidad * costo,
          precioVent,
          item.caducidad || null,
        ]
      );

      // series (si aplica)
      if (Array.isArray(item.series) && item.series.length > 0) {
        for (const serieRaw of item.series) {
          const serie = (serieRaw || '').trim();
          if (!serie) continue;
          await conn.query(
            `INSERT INTO series_compra (id_compra, id_producto, serie) 
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE id_compra = VALUES(id_compra)`,
            [compraId, item.id_producto, serie]
          );
        }
      }

      // stock
      await conn.query(
        `UPDATE productos 
           SET cantidad_inicial = cantidad_inicial + ? 
         WHERE id_producto = ?`,
        [cantidad, item.id_producto]
      );

      // precios (si mandaste costo y/o precioVenta)
      if (costo > 0 || precioVent > 0) {
        await conn.query(
          `UPDATE productos 
              SET 
                precio_compra = CASE WHEN ? > 0 THEN ? ELSE precio_compra END,
                precio_venta  = CASE WHEN ? > 0 THEN ? ELSE precio_venta  END
            WHERE id_producto = ?`,
          [costo, costo, precioVent, precioVent, item.id_producto]
        );
      }
    }

    await conn.commit();
    res.json({ ok: true, message: 'Compra registrada exitosamente', id_compra: compraId });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error('Error al registrar compra:', {
      message: error.message,
      code: error.code,
      sql: error.sql,
      sqlMessage: error.sqlMessage,
    });
    res.status(500).json({ ok: false, message: 'Error al registrar compra' });
  } finally {
    if (conn) conn.release();
  }
};

// GET /tipos-venta
const getTiposVenta = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM tipos_venta`);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener tipos de venta:', error.message);
    res.status(500).json({ message: 'Error al obtener tipos de venta' });
  }
};

// POST /proveedores
const crearProveedor = async (req, res) => {
  const { nit, nombre, direccion, telefono } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO proveedores (nit, nombre, direccion, telefono) VALUES (?, ?, ?, ?)`,
      [nit, nombre, direccion, telefono]
    );
    res.status(201).json({ message: 'Proveedor registrado correctamente', id: result.insertId });
  } catch (error) {
    console.error('Error al registrar proveedor:', error.message);
    res.status(500).json({ message: 'Error al registrar proveedor' });
  }
};

// GET /compras/resumen-series
const obtenerResumenComprasConSeries = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id_compra,
        c.no_factura_compra,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        COUNT(DISTINCT dc.id_producto) AS total_productos,
        COUNT(sc.id) AS total_series
      FROM compras c
      LEFT JOIN detalle_compras dc ON c.id_compra = dc.id_compra
      LEFT JOIN series_compra sc   ON c.id_compra = sc.id_compra
      GROUP BY c.id_compra, c.no_factura_compra, c.fecha
      ORDER BY c.id_compra DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener resumen de compras:', error.message);
    res.status(500).json({ message: 'Error al obtener resumen de compras' });
  }
};

// GET /compras?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
const obtenerComprasConFiltros = async (req, res) => {
  const { desde, hasta } = req.query;
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id_compra,
        c.no_factura_compra,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        COUNT(DISTINCT dc.id_producto) AS total_productos,
        COUNT(sc.id) AS total_series
      FROM compras c
      LEFT JOIN detalle_compras dc ON c.id_compra = dc.id_compra
      LEFT JOIN series_compra sc   ON c.id_compra = sc.id_compra
      WHERE c.fecha BETWEEN ? AND ?
      GROUP BY c.id_compra, c.no_factura_compra, c.fecha
      ORDER BY c.fecha DESC
    `, [desde, hasta]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener compras:', error.message);
    res.status(500).json({ message: 'Error al obtener compras' });
  }
};

// GET /correcciones/detalle-series/:id_compra
const getSeriesDetallePorCompra = async (req, res) => {
  const { id_compra } = req.params;
  try {
    const [rows] = await db.query(`
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
    console.error('Error al obtener detalle de series:', error.message);
    res.status(500).json({ message: 'Error al obtener detalle de series' });
  }
};

module.exports = {
  crearCompra,
  getTiposVenta,
  crearProveedor,
  obtenerResumenComprasConSeries,
  obtenerComprasConFiltros,
  getSeriesDetallePorCompra,
};
