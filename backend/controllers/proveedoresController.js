const db = require('../config/db'); // 👈 pool con promesas

// Obtener todos los proveedores
const getProveedores = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM proveedores");
    res.json(result);
  } catch (error) {
    console.error("Error al obtener proveedores:", error.message, error.stack);
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

// Crear proveedor
const crearProveedor = async (req, res) => {
  const { nombre, nit, dpi, direccion, telefono } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO proveedores (nombre, nit, dpi, direccion, telefono) VALUES (?, ?, ?, ?, ?)",
      [nombre, nit, dpi, direccion, telefono]
    );
    console.log("aqui proveeodr")
    res.json({ id: result.insertId, message: "Proveedor registrado exitosamente" });
  } catch (error) {
    console.error("Error al crear proveedor:", error.message);
    res.status(500).json({ message: "Error al crear proveedor" });
  }
};

// Actualizar proveedor
const actualizarProveedor = async (req, res) => {
  const { id } = req.params;
  const { nombre, nit, dpi, direccion, telefono } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE proveedores SET nombre = ?, nit = ?, dpi = ?, direccion = ?, telefono = ? WHERE id = ?",
      [nombre, nit, dpi, direccion, telefono, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar proveedor:", error.message);
    res.status(500).json({ message: "Error al actualizar proveedor" });
  }
};

// Eliminar proveedor
const eliminarProveedor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM proveedores WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar proveedor:", error.message);
    res.status(500).json({ message: "Error al eliminar proveedor" });
  }
};

module.exports = {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
};
