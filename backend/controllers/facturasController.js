const db = require('../config/db'); // 👈 pool con promesas

// Obtener todas las facturas
const getFacturas = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM documentos_fel ORDER BY fecha_emision DESC");
    const [result2] = await db.query("SELECT * FROM detalle_ventas WHERE id_venta = 148");
    console.log(result2);
    res.json(result);
  } catch (error) {
    console.error("Error al obtener Facturas:", error.message, error.stack);
    res.status(500).json({ message: "Error al obtener Facturas" });
  }
};

module.exports = {
  getFacturas
};
