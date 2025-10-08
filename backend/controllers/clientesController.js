const db = require('../config/db'); // 👈 pool con promesas


// Obtener todos los clientes
const getClientes = async (req, res) => {
  try {
    const [clientes] = await db.query("SELECT * FROM clientes");
    res.json(clientes);
  } catch (error) {
    console.error("Error al obtener los clientes:", error.message, error.stack);
    res.status(500).json({ message: "Error al obtener los clientes" });
  }
};

// Crear un cliente
const crearCliente = async (req, res) => {
  const {
    nombre,
    nit,
    dpi,
    direccion,
    telefono,
    correo,
    codigo_postal,
    municipio,
    departamento,
    pais = "GT",
    tiene_credito = 0
  } = req.body;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // 1) Crear cliente
    const [result] = await conn.query(
      `INSERT INTO clientes (
        nombre, nit, dpi, direccion, telefono, correo,
        codigo_postal, municipio, departamento, pais, tiene_credito
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre, nit, dpi, direccion, telefono, correo,
        codigo_postal, municipio, departamento, pais, tiene_credito
      ]
    );

    const id_cliente = result.insertId;

    // 2) Seed papelería (equivalente a asignarPapeleria de Firebase)
    const [tipos] = await conn.query(
      `SELECT id_tipo_doc, nombre FROM tipo_documento ORDER BY id_tipo_doc`
    );

    if (tipos.length) {
      // Inserción masiva (INSERT IGNORE evita duplicados si ya existe la pareja)
      const values = tipos.map(t => [id_cliente, t.id_tipo_doc, t.nombre, 0]);
      await conn.query(
        `INSERT IGNORE INTO papeleria (id_cliente, id_tipo_doc, nombre_documento, estado)
         VALUES ?`,
        [values]
      );
    }

    await conn.commit();
    return res.json({ id: id_cliente, message: "Cliente creado exitosamente" });

  } catch (error) {
    await conn.rollback();
    console.error("Error al crear cliente:", error.message);
    return res.status(500).json({ message: "Error al crear cliente" });
  } finally {
    conn.release();
  }
};


// Actualizar un cliente
const actualizarCliente = async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    nit,
    dpi,
    direccion,
    telefono,
    correo,
    codigo_postal,
    municipio,
    departamento,
    pais = "GT",
    tiene_credito = 0
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE clientes SET 
        nombre = ?, nit = ?, dpi = ?, direccion = ?, telefono = ?, 
        correo = ?, codigo_postal = ?, municipio = ?, 
        departamento = ?, pais = ?, tiene_credito = ?
      WHERE id_cliente = ?`,
      [
        nombre, nit, dpi, direccion, telefono,
        correo, codigo_postal, municipio,
        departamento, pais, tiene_credito, id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }

    res.json({ message: "Cliente actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar cliente:", error.message, error.stack);
    res.status(500).json({ message: "Error al actualizar cliente" });
  }
};

// Eliminar un cliente
const eliminarCliente = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM clientes WHERE id_cliente = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json({ message: "Cliente eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar cliente:", error.message, error.stack);
    res.status(500).json({ message: "Error al eliminar cliente" });
  }
};

// Buscar cliente por DPI
const buscarClientePorDPI = async (req, res) => {
  const { dpi } = req.params;
  try {
    const [result] = await db.query(
      "SELECT * FROM clientes WHERE dpi = ?",
      [dpi]
    );
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(404).json({ message: "Cliente no encontrado" });
    }
  } catch (error) {
    console.error("Error al buscar cliente:", error.message, error.stack);
    res.status(500).json({ message: "Error al buscar cliente" });
  }
};

module.exports = {
  getClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  buscarClientePorDPI,
};
