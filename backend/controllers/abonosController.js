const { promisePool } = require("../config/db");

const registrarAbono = async (req, res) => {
  const { id_cliente, monto, observaciones } = req.body;

  if (!id_cliente || !monto) {
    return res.status(400).json({ message: "Cliente y monto son obligatorios" });
  }

  const conn = await promisePool.getConnection();
  try {
    await conn.beginTransaction();

    // Actualizar saldo
    await conn.query(
      `UPDATE clientes SET saldo = saldo - ? WHERE id_cliente = ?`,
      [monto, id_cliente]
    );

    // Insertar en historial
    await conn.query(
      `INSERT INTO historial_saldos (id_cliente, tipo_movimiento, monto, observaciones) 
       VALUES (?, 'Abono', ?, ?)`,
      [id_cliente, monto, observaciones || '']
    );

    await conn.commit();
    res.json({ message: "Abono registrado exitosamente" });
  } catch (error) {
    await conn.rollback();
    console.error("Error al registrar abono:", error.message);
    res.status(500).json({ message: "Error al registrar abono", error });
  } finally {
    conn.release();
  }
};

module.exports = {
  registrarAbono
};
