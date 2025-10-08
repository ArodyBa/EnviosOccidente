const db = require('../config/db'); // <- promisePool

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const [result] = await db.query("SELECT id_categoria, nombre FROM categorias");
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías", error });
  }
};

// Obtener todos los productos
const getProductos = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        p.id_producto AS id,
        p.codigo,
        p.descripcion,
        p.precio_compra,
        p.precio_venta,
        p.fecha_vencimiento,
        p.cantidad_inicial,
        p.nivel_minimo,
        p.id_categoria,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
    `);
    console.log("aqui get")
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error });
  }
};

// Crear producto
const crearProducto = async (req, res) => {
  console.log("Aqui")
  const {
    codigo,
    descripcion,
    id_categoria,
    precio_compra,
    precio_venta,
    fecha_vencimiento,
    cantidad_inicial = 0,
    nivel_minimo = 0
  } = req.body;
console.log("AQUI")
  try {
    const [result] = await db.query(
      `INSERT INTO productos 
        (Codigo, descripcion, id_categoria, precio_compra, precio_venta, fecha_vencimiento, cantidad_inicial, nivel_minimo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo,
        descripcion,
        id_categoria,
        precio_compra,
        precio_venta,
        fecha_vencimiento,
        cantidad_inicial,
        nivel_minimo
      ]
    );

    res.status(201).json({
      
      message: "Producto creado correctamente",
      id: result.insertId
    });
  } catch (error) {
    console.log("error p")
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ message: "Error al crear producto", error });
  }
};
const getUnidadesMedida = async (req, res) => {
  res.status(200).json([]); // o consulta real si ya tienes tabla
};

const getTiposPrecio = async (req, res) => {
  res.status(200).json([]);
};

module.exports = {
  getCategorias,
  getProductos,
  crearProducto, getTiposPrecio, getUnidadesMedida,
};
