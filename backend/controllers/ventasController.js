const { pool, promisePool } = require("../config/db");
const axios = require("axios");

const getTiposDocumento = async (req, res) => {
  try {
    const [result] = await promisePool.query("SELECT * FROM tipos_documento");
    res.json(result);
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error.message);
    res.status(500).json({ message: "Error al obtener tipos de documento", error });
  }
};

const getTiposVenta = async (req, res) => {
  try {
    const [result] = await promisePool.query("SELECT * FROM tipos_venta");
    res.json(result);
  } catch (error) {
    console.error("Error al obtener tipos de venta:", error.message);
    res.status(500).json({ message: "Error al obtener tipos de venta", error });
  }
};
/*
const crearVenta = async (req, res) => {
  const { id_cliente, fecha_venta, tipo_venta, id_moneda, detalles } = req.body;

  const conn = await pool.promise().getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insertar venta
    const [ventaRes] = await conn.query(
      "INSERT INTO ventas (id_cliente, fecha_venta, tipo_venta, id_moneda) VALUES (?, ?, ?, ?)",
      [id_cliente, fecha_venta, tipo_venta, id_moneda]
    );

    const ventaId = ventaRes.insertId;
    let totalVenta = 0;
    const detallesVenta = []; // 🔧 Esta línea es clave


    // 2. Insertar detalles y descontar stock
    /* for (const item of detalles) {
      const total = parseFloat(item.total);
      totalVenta += total;

      await conn.query(
        "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)",
        [
          ventaId,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          total
        ]
      );

      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial - ? WHERE id_producto = ?",
        [item.cantidad, item.id_producto]
      );
      detallesVenta.push(item); 
    }  */
/*
for (const item of detalles) {
const total = parseFloat(item.total);
totalVenta += total;

await conn.query(
 "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)",
 [ventaId, item.id_producto, item.cantidad, item.precio_unitario, total]
);

// Validación: Deben venir las series exactas
if (!item.series || item.series.length !== item.cantidad) {
 throw new Error(`Las series para el producto ID ${item.id_producto} no coinciden con la cantidad`);
}


// Actualizar estado de cada serie a "vendida" (estado = 0)
for (const serie of item.series) {
 await conn.query(
   "UPDATE series_compra SET estado = 0 WHERE id_producto = ? AND serie = ? AND estado = 1",
   [item.id_producto, serie]
 );
}

// Descontar stock
await conn.query(
 "UPDATE productos SET cantidad_inicial = cantidad_inicial - ? WHERE id_producto = ?",
 [item.cantidad, item.id_producto]
);

detallesVenta.push(item);
}
 // 3. Si es a crédito, actualizar saldo del cliente y registrar historial
 if (tipo_venta === 'Crédito') {
   const [cliente] = await conn.query("SELECT saldo FROM clientes WHERE id_cliente = ?", [id_cliente]);
   const saldoActual = cliente[0]?.saldo || 0;
   const nuevoSaldo = saldoActual + totalVenta;

   // Actualizar saldo
   await conn.query("UPDATE clientes SET saldo = ? WHERE id_cliente = ?", [nuevoSaldo, id_cliente]);

   // Insertar en historial  
   await conn.query(
     `INSERT INTO historial_saldos 
       (id_cliente, tipo_movimiento, monto, saldo_resultante, observaciones)
      VALUES (?, 'VENTA_CREDITO', ?, ?, ?)`,
     [id_cliente, totalVenta, nuevoSaldo, `Venta a crédito ID ${ventaId}`]
   );
 }
 const [clienteRow] = await conn.query("SELECT * FROM clientes WHERE id_cliente = ?", [id_cliente]);
 const clienteData = clienteRow[0];
 await conn.commit();
 res.json({
   message: "Venta registrada exitosamente",
   id_venta: ventaId,
   cliente: clienteData,
   detalles: detallesVenta,
 });
} catch (error) {
 await conn.rollback();
 console.error("Error al registrar venta:", error.message);
 res.status(500).json({ message: "Error al registrar venta", error });
} finally {
 conn.release();
}
};

*/
/*
const crearVenta = async (req, res) => {
  const { id_cliente, fecha_venta, tipo_venta, id_moneda, detalles } = req.body;
  const conn = await pool.promise().getConnection();

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
      const { id_producto, cantidad, precio_unitario, total, series } = item;

      if (!series || series.length !== cantidad) {
        throw new Error(`Las series para el producto ID ${id_producto} no coinciden con la cantidad`);
      }

      // ← Corregimos aquí la construcción del SQL
      const placeholders = series.map(() => '?').join(',');
      const [seriesDisponibles] = await conn.query(
        `
        SELECT COUNT(*) AS total 
        FROM series_compra 
        WHERE id_producto = ? 
        AND serie IN (${placeholders}) 
        AND estado = 1
        `,
        [id_producto, ...series]
      );

      if (seriesDisponibles[0].total !== series.length) {
        throw new Error(`Algunas series no existen o ya están vendidas para el producto ID ${id_producto}`);
      }

      await conn.query(
        `INSERT INTO detalle_ventas 
        (id_venta, id_producto, cantidad, precio_unitario, total) 
        VALUES (?, ?, ?, ?, ?)`,
        [ventaId, id_producto, cantidad, precio_unitario, total]
      );

      // ← También corregimos esta parte
      await conn.query(
        `UPDATE series_compra SET estado = 0 
         WHERE id_producto = ? AND serie IN (${placeholders})`,
        [id_producto, ...series]
      );

      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial - ? WHERE id_producto = ?",
        [cantidad, id_producto]
      );

      detallesVenta.push(item);
      totalVenta += total;
    }

    if (tipo_venta === 'Crédito') {
      const [cliente] = await conn.query("SELECT saldo FROM clientes WHERE id_cliente = ?", [id_cliente]);
      const saldoActual = cliente[0]?.saldo || 0;
      const nuevoSaldo = saldoActual + totalVenta;

      await conn.query("UPDATE clientes SET saldo = ? WHERE id_cliente = ?", [nuevoSaldo, id_cliente]);

      await conn.query(
        `INSERT INTO historial_saldos 
          (id_cliente, tipo_movimiento, monto, saldo_resultante, observaciones)
         VALUES (?, 'VENTA_CREDITO', ?, ?, ?)`,
        [id_cliente, totalVenta, nuevoSaldo, `Venta a crédito ID ${ventaId}`]
      );
    }

    const [clienteRow] = await conn.query("SELECT * FROM clientes WHERE id_cliente = ?", [id_cliente]);
    await conn.commit();

    res.json({
      message: "Venta registrada exitosamente",
      id_venta: ventaId,
      cliente: clienteRow[0],
      detalles: detallesVenta
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al registrar venta:", error.message);
    res.status(500).json({ message: "Error al registrar venta", error: error.message });
  } finally {
    conn.release();
  }
};
*/
const crearVenta = async (req, res) => {
  const { id_cliente, fecha_venta, tipo_venta, id_moneda, detalles } = req.body;
  const conn = await pool.promise().getConnection();

  try {
    await conn.beginTransaction();

    // Crear venta sin el total todavía
    const [ventaRes] = await conn.query(
      "INSERT INTO ventas (id_cliente, fecha_venta, tipo_venta, id_moneda) VALUES (?, ?, ?, ?)",
      [id_cliente, fecha_venta, tipo_venta, id_moneda]
    );

    const ventaId = ventaRes.insertId;
    let totalVenta = 0;
    const detallesVenta = [];

    for (const item of detalles) {
      const { id_producto, cantidad, precio_unitario, total, series } = item;

      if (!series || series.length !== cantidad) {
        throw new Error(`Las series para el producto ID ${id_producto} no coinciden con la cantidad`);
      }

      const placeholders = series.map(() => '?').join(',');
      const [seriesDisponibles] = await conn.query(
        `
        SELECT COUNT(*) AS total 
        FROM series_compra 
        WHERE id_producto = ? 
        AND serie IN (${placeholders}) 
        AND estado = 1
        `,
        [id_producto, ...series]
      );

      if (seriesDisponibles[0].total !== series.length) {
        throw new Error(`Algunas series no existen o ya están vendidas para el producto ID ${id_producto}`);
      }

      await conn.query(
        `INSERT INTO detalle_ventas 
         (id_venta, id_producto, cantidad, precio_unitario, total) 
         VALUES (?, ?, ?, ?, ?)`,
        [ventaId, id_producto, cantidad, precio_unitario, total]
      );

      await conn.query(
        `UPDATE series_compra SET estado = 0, id_venta = ? 
         WHERE id_producto = ? AND serie IN (${placeholders})`,
        [ventaId, id_producto, ...series]
      );

      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial - ? WHERE id_producto = ?",
        [cantidad, id_producto]
      );

      detallesVenta.push(item);
      totalVenta += total;
    }

    // 👉 Guardar el total de la venta
    await conn.query(
      "UPDATE ventas SET total = ? WHERE id_venta = ?",
      [totalVenta, ventaId]
    );
    if (tipo_venta === 'Crédito') {
      const [cliente] = await conn.query("SELECT saldo FROM clientes WHERE id_cliente = ?", [id_cliente]);
      const saldoActual = cliente[0]?.saldo || 0;
      const nuevoSaldo = saldoActual + totalVenta;

      await conn.query("UPDATE clientes SET saldo = ? WHERE id_cliente = ?", [nuevoSaldo, id_cliente]);

      await conn.query(
        `INSERT INTO historial_saldos 
         (id_cliente, tipo_movimiento, monto, saldo_resultante, observaciones)
         VALUES (?, 'VENTA_CREDITO', ?, ?, ?)`,
        [id_cliente, totalVenta, nuevoSaldo, `Venta a crédito ID ${ventaId}`]
      );
    }

    const [clienteRow] = await conn.query("SELECT * FROM clientes WHERE id_cliente = ?", [id_cliente]);

    await conn.commit();

    res.json({
      message: "Venta registrada exitosamente",
      id_venta: ventaId,
      cliente: clienteRow[0],
      detalles: detallesVenta
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al registrar venta:", error.message);
    res.status(400).json({ message: error.message });
  } finally {
    conn.release();
  }
};

const anularVenta = async (valores, res) => {
  const { idVenta } = valores.body;
  const idventa = idVenta;
  const [detalle_ventas] = await promisePool.query("SELECT * FROM detalle_ventas WHERE id_venta = ?",
    [idventa]);
  const [series_compra] = await promisePool.query("SELECT * FROM series_compra WHERE id_venta = ?",
    [idventa]);

  const conn = await pool.promise().getConnection();
  try {
    await conn.beginTransaction();

    // Anular venta
    const [ventaRes] = await conn.query(
      `UPDATE ventas  SET total = 0
          WHERE id_venta = ?`,
      [idventa]
    );

    for (const item of detalle_ventas) {
      console.log("Entro en el For");
      const { id_producto, cantidad } = item;

      await conn.query(
        `UPDATE detalle_ventas SET cantidad = 0, precio_unitario = 0, total = 0
                WHERE id_venta = ? AND id_producto = ?`,
        [idventa, id_producto]
      );

      await conn.query(
        "UPDATE productos SET cantidad_inicial = cantidad_inicial + ? WHERE id_producto = ?",
        [cantidad, id_producto]
      );
    }

    // Bucle para actualizar el estado de las series de compra
    for (const item of series_compra) {
      const { id_producto, serie } = item;

      // La propiedad 'serie' es un string, no un array. No necesitas '.map()'.
      await conn.query(
        `UPDATE series_compra SET estado = 1, id_venta = 0
                WHERE id_producto = ? AND serie = ? AND id_venta = ?`,
        [id_producto, serie, idventa]
      );
    }

    await conn.commit();

    res.json({
      message: "Venta anulada exitosamente",
      id_venta: idventa,
      cliente: ventaRes[0]
    });

  } catch (error) {
    await conn.rollback();
    console.error("Error al registrar venta:", error.message);
    res.status(500).json({ message: "Error al registrar venta", error: error.message });
  } finally {
    conn.release();
  }
};

const generarXMLFEL = (id_cliente, detalles, total) => {
  return {
    id_cliente,
    detalles,
    total,
    emisor: "2121010001",
    contrato: "2122010001",
  };
};
const validarSeries = async (req, res) => {
  const { id_producto, series } = req.body;

  if (!id_producto || !Array.isArray(series)) {
    return res.status(400).json({ message: "Parámetros inválidos" });
  }

  try {
    const placeholders = series.map(() => '?').join(',');
    const [rows] = await pool.query(
      `
      SELECT serie FROM series_compra 
      WHERE id_producto = ? 
        AND serie IN (${placeholders}) 
        AND estado = 0
      `,
      [id_producto, ...series]
    );

    const seriesVendidas = rows.map(r => r.serie);
    res.json({ seriesVendidas });
  } catch (error) {
    console.error("Error al validar series:", error.message);
    res.status(500).json({ message: "Error al validar series", error: error.message });
  }
};

const getUnidadesPorProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        c.unidad_destino_id AS id,
        u.nombre,
        pp.precio,
        COALESCE(SUM(e.stock_actual), 0) AS stock
      FROM conversiones_producto c
      JOIN unidades_medida u ON c.unidad_destino_id = u.id
      LEFT JOIN precios_producto pp ON pp.producto_id = c.producto_id AND pp.unidad_id = c.unidad_destino_id
      LEFT JOIN existencias_producto e ON e.producto_id = c.producto_id AND e.unidad_id = c.unidad_destino_id
      WHERE c.producto_id = ?
      GROUP BY c.unidad_destino_id, u.nombre, pp.precio
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener unidades por producto:", error.message);
    res.status(500).json({ message: "Error al obtener unidades", error });
  }
};

module.exports = {
  getTiposDocumento,
  getTiposVenta,
  crearVenta,
  getUnidadesPorProducto, 
  validarSeries,
  anularVenta
};
