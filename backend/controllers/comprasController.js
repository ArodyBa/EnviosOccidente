const { pool, promisePool } = require("../config/db");

// Crear compra principal y su detalle
const crearCompra = async (req, res) => {
  const { fecha, no_factura_compra, id_proveedor, detalles } = req.body;

  const conn = await pool.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [compraRes] = await conn.query(
      "INSERT INTO compras (fecha, no_factura_compra, id_proveedor) VALUES (?, ?, ?)",
      [fecha, no_factura_compra, id_proveedor]
    );

    const compraId = compraRes.insertId;

    for (const item of detalles) {
      await conn.query(
        `INSERT INTO detalle_compras 
        (id_compra, id_producto, cantidad_compra, descripcion, precio_unitario_compra, total_compra, precio_venta, caducidad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          compraId,
          item.id_producto,
          item.cantidad,
          item.descripcion,
          item.precio_unitario,
          item.total,
          item.precio_venta,
          item.caducidad || null
        ]
      );
      if (item.series && item.series.length > 0) {
        for (const serie of item.series) {
          await conn.query(
            `INSERT INTO series_compra (id_compra, id_producto, serie) VALUES (?, ?, ?)`,
            [compraId, item.id_producto, serie.trim()]
          );
        }
      }
      // Aumentar stock del producto
      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial + ? WHERE id_producto = ?",
        [item.cantidad, item.id_producto]
      );
    }

    await conn.commit();
    res.json({ message: "Compra registrada exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error("Error al registrar compra:", error.message);
    res.status(500).json({ message: "Error al registrar compra", error });
  } finally {
    conn.release();
  }
};

// Obtener tipos de venta desde la tabla tipos_venta (si existe)
const getTiposVenta = async (req, res) => {
  try {
    const [result] = await promisePool.query("SELECT * FROM tipos_venta");
    res.json(result);
  } catch (error) {
    console.error("Error al obtener tipos de venta:", error.message);
    res.status(500).json({ message: "Error al obtener tipos de venta", error });
  }
};

// Crear proveedor
const crearProveedor = async (req, res) => {
  const { nit, nombre, direccion, telefono } = req.body;

  try {
    const [result] = await promisePool.query(
      "INSERT INTO proveedores (nit, nombre, direccion, telefono) VALUES (?, ?, ?, ?)",
      [nit, nombre, direccion, telefono]
    );

    res.status(201).json({ message: "Proveedor registrado correctamente", id: result.insertId });
  } catch (error) {
    console.error("Error al registrar proveedor:", error.message);
    res.status(500).json({ message: "Error al registrar proveedor", error });
  }
};
const obtenerResumenComprasConSeries = async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        c.id_compra,
        c.no_factura_compra,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        COUNT(DISTINCT dc.id_producto) AS total_productos,
        COUNT(sc.id) AS total_series
      FROM compras c
      LEFT JOIN detalle_compras dc ON c.id_compra = dc.id_compra
      LEFT JOIN series_compra sc ON c.id_compra = sc.id_compra
      GROUP BY c.id_compra, c.no_factura_compra, c.fecha
      ORDER BY c.id_compra DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener resumen de compras", error: error.message });
  }
};

const obtenerComprasConFiltros = async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const [rows] = await pool.promise().query(`
      SELECT 
        c.id_compra,
        c.no_factura_compra,
        DATE_FORMAT(c.fecha, '%Y-%m-%d') AS fecha,
        COUNT(DISTINCT dc.id_producto) AS total_productos,
        COUNT(sc.id) AS total_series
      FROM compras c
      LEFT JOIN detalle_compras dc ON c.id_compra = dc.id_compra
      LEFT JOIN series_compra sc ON c.id_compra = sc.id_compra
      WHERE c.fecha BETWEEN ? AND ?
      GROUP BY c.id_compra, c.no_factura_compra, c.fecha
      ORDER BY c.fecha DESC
    `, [desde, hasta]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener compras", error: error.message });
  }
};
// GET /correcciones/detalle-series/:id_compra
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



module.exports = {
  crearCompra,
  getTiposVenta,
  crearProveedor, obtenerResumenComprasConSeries, 
  obtenerComprasConFiltros,getSeriesDetallePorCompra
};
