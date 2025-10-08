const db = require('../config/db'); // ✅

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM categorias");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías", error });
  }
};

// Insertar una nueva categoría
const insertarCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    await db.query(
      "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion]
    );
    res.json({ message: "Categoría registrada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al insertar categoría", error });
  }
};

// Actualizar categoría
const actualizarCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    await db.query(
      "UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?",
      [nombre, descripcion, id]
    );
    res.json({ message: "Categoría actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar categoría", error });
  }
};

// Eliminar categoría
const eliminarCategoria = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM categorias WHERE id_categoria = ?", [id]);
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar categoría", error });
  }
};

module.exports = {
  getCategorias,
  insertarCategoria,
  actualizarCategoria,
  eliminarCategoria
};
