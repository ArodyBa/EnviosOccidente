const db = require('../config/db');

const getDefaultEstadoId = async (conn) => {
  const [[row]] = await conn.query(`SELECT id_estado_envio FROM estados_envio WHERE activo=1 ORDER BY orden LIMIT 1`);
  return row?.id_estado_envio || null;
};

// Nota: tracking_code ahora se ingresa manualmente al crear el envío

// GET /envios/tipos
const getTiposEnvio = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM envio_tipos WHERE activo=1 ORDER BY nombre`);
    res.json(rows);
  } catch (e) {
    console.error('getTiposEnvio:', e.message);
    res.status(500).json({ message: 'Error al obtener tipos de envío' });
  }
};

// POST /envios/tipos
const createTipoEnvio = async (req, res) => {
  try {
    const { nombre, priced_by_weight } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre es requerido' });
    const [r] = await db.query(
      `INSERT INTO envio_tipos (nombre, priced_by_weight) VALUES (?, ?)`,
      [nombre, priced_by_weight ? 1 : 0]
    );
    res.status(201).json({ id_tipo_envio: r.insertId, nombre, priced_by_weight: !!priced_by_weight });
  } catch (e) {
    console.error('createTipoEnvio:', e.message);
    res.status(500).json({ message: 'Error al crear tipo de envío' });
  }
};

// GET /envios/tarifas?tipo=ID
const getTarifasEnvio = async (req, res) => {
  try {
    const tipo = Number(req.query.tipo) || null;
    let sql = `SELECT * FROM envio_tarifas WHERE activo=1`;
    const params = [];
    if (tipo) { sql += ` AND id_tipo_envio=?`; params.push(tipo); }
    sql += ` ORDER BY nombre`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('getTarifasEnvio:', e.message);
    res.status(500).json({ message: 'Error al obtener tarifas' });
  }
};

// POST /envios/tarifas
const createTarifaEnvio = async (req, res) => {
  try {
    const { id_tipo_envio, nombre, largo_cm, ancho_cm, alto_cm, peso_base_kg, precio_base } = req.body;
    if (!id_tipo_envio || !nombre || !precio_base) {
      return res.status(400).json({ message: 'id_tipo_envio, nombre y precio_base son requeridos' });
    }
    const [r] = await db.query(
      `INSERT INTO envio_tarifas (id_tipo_envio, nombre, largo_cm, ancho_cm, alto_cm, peso_base_kg, precio_base)
       VALUES (?,?,?,?,?,?,?)`,
      [id_tipo_envio, nombre, largo_cm || null, ancho_cm || null, alto_cm || null, peso_base_kg || null, precio_base]
    );
    res.status(201).json({ id_tarifa_envio: r.insertId });
  } catch (e) {
    console.error('createTarifaEnvio:', e.message);
    res.status(500).json({ message: 'Error al crear tarifa' });
  }
};

// POST /envios  { fecha, id_cliente, observaciones?, detalles: [ { cantidad, id_tipo_envio, id_tarifa_envio?, precio_unitario?, peso_kg? , descripcion? } ] }
const crearEnvio = async (req, res) => {
  const { fecha, id_cliente, observaciones, detalles, tracking_code } = req.body;
  if (!fecha || !id_cliente || !Array.isArray(detalles) || detalles.length === 0) {
    return res.status(400).json({ message: 'fecha, id_cliente y al menos un detalle son requeridos' });
  }
  const code = String(tracking_code || '').trim();
  if (!code) return res.status(400).json({ message: 'tracking_code es requerido' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Validar unicidad de tracking
    const [[exists]] = await conn.query(`SELECT id_envio FROM envios WHERE tracking_code = ?`, [code]);
    if (exists) {
      throw new Error('El tracking_code ya existe');
    }

    const [h] = await conn.query(
      `INSERT INTO envios (fecha, id_cliente, observaciones, total, estado, tracking_code) VALUES (?,?,?,?, 'CREADO', ?)`,
      [fecha, id_cliente, observaciones || null, 0, code]
    );
    const id_envio = h.insertId;

    // Cache tipos (para saber si es priced_by_weight)
    const [tipos] = await conn.query(`SELECT id_tipo_envio, priced_by_weight FROM envio_tipos`);
    const mapTipoPeso = new Map(tipos.map(t => [t.id_tipo_envio, !!t.priced_by_weight]));

    let total = 0;
    for (const d of detalles) {
      const cantidad = Number(d.cantidad) || 1;
      const id_tipo_envio = Number(d.id_tipo_envio);
      const id_tarifa_envio = d.id_tarifa_envio ? Number(d.id_tarifa_envio) : null;
      const peso_kg = d.peso_kg != null ? Number(d.peso_kg) : null;
      const descripcion = d.descripcion || null;

      if (!id_tipo_envio || cantidad <= 0) {
        throw new Error('Detalle inválido: tipo y cantidad son requeridos');
      }

      let precio_unitario = d.precio_unitario != null ? Number(d.precio_unitario) : null;
      if (precio_unitario == null && id_tarifa_envio) {
        const [[tarifa]] = await conn.query(`SELECT precio_base FROM envio_tarifas WHERE id_tarifa_envio=?`, [id_tarifa_envio]);
        if (tarifa) precio_unitario = Number(tarifa.precio_base);
      }
      if (precio_unitario == null) throw new Error('precio_unitario no definido en detalle');

      const byWeight = mapTipoPeso.get(id_tipo_envio) === true;
      const base = byWeight ? precio_unitario * (peso_kg || 0) : precio_unitario;
      const total_linea = +(cantidad * base).toFixed(2);
      total += total_linea;

      await conn.query(
        `INSERT INTO envios_detalle (id_envio, id_tipo_envio, id_tarifa_envio, descripcion, cantidad, peso_kg, precio_unitario, total_linea)
         VALUES (?,?,?,?,?,?,?,?)`,
        [id_envio, id_tipo_envio, id_tarifa_envio, descripcion, cantidad, peso_kg, precio_unitario, total_linea]
      );
    }

    await conn.query(`UPDATE envios SET total=? WHERE id_envio=?`, [+(total.toFixed(2)), id_envio]);

    // Estado inicial
    const estadoInicial = await getDefaultEstadoId(conn);
    if (estadoInicial) {
      await conn.query(`UPDATE envios SET id_estado_actual=? WHERE id_envio=?`, [estadoInicial, id_envio]);
      await conn.query(`INSERT INTO envios_tracking (id_envio, id_estado_envio, nota) VALUES (?,?,?)`, [id_envio, estadoInicial, 'Creación de envío']);
    }

    await conn.commit();
    res.status(201).json({ id_envio, tracking_code: code, total: +total.toFixed(2) });
  } catch (e) {
    await conn.rollback();
    console.error('crearEnvio:', e.message);
    const status = e.message && e.message.includes('tracking_code ya existe') ? 409 : 500;
    res.status(status).json({ message: 'Error al crear envío', error: e.message });
  } finally {
    conn.release();
  }
};

// GET /envios/:id
const getEnvio = async (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'id inválido' });
  try {
    const [[enc]] = await db.query(
      `SELECT e.*, c.nombre as cliente_nombre
       FROM envios e
       INNER JOIN clientes c ON e.id_cliente=c.id_cliente
       WHERE e.id_envio=?`, [id]
    );
    if (!enc) return res.status(404).json({ message: 'Envío no encontrado' });
    const [det] = await db.query(
      `SELECT d.*, te.nombre AS tipo_nombre, ta.nombre AS tarifa_nombre
       FROM envios_detalle d
       INNER JOIN envio_tipos te ON d.id_tipo_envio=te.id_tipo_envio
       LEFT JOIN envio_tarifas ta ON d.id_tarifa_envio=ta.id_tarifa_envio
       WHERE d.id_envio=?`, [id]
    );
    res.json({ encabezado: enc, detalle: det });
  } catch (e) {
    console.error('getEnvio:', e.message);
    res.status(500).json({ message: 'Error al obtener envío' });
  }
};

// GET /tracking/:code  -> para landing y consulta pública
const getTrackingByCode = async (req, res) => {
  const code = String(req.params.code || '').trim();
  if (!code) return res.status(400).json({ message: 'code requerido' });
  try {
    const [[enc]] = await db.query(
      `SELECT e.id_envio, e.tracking_code, e.fecha, e.total, e.id_estado_actual,
              c.nombre AS cliente_nombre, c.dpi AS cliente_dpi
         FROM envios e
         INNER JOIN clientes c ON c.id_cliente=e.id_cliente
        WHERE e.tracking_code=?`, [code]
    );
    if (!enc) return res.status(404).json({ message: 'Tracking no encontrado' });

    const [estados] = await db.query(`SELECT id_estado_envio, nombre FROM estados_envio WHERE activo=1 ORDER BY orden`);
    const totalEstados = estados.length || 1;
    const idxActual = estados.findIndex(s => s.id_estado_envio === enc.id_estado_actual);
    const progress = Math.max(0, Math.round(((idxActual + 1) / totalEstados) * 100));

    const [hist] = await db.query(
      `SELECT et.*, es.nombre AS estado
         FROM envios_tracking et
         INNER JOIN estados_envio es ON es.id_estado_envio=et.id_estado_envio
        WHERE et.id_envio=?
        ORDER BY et.fecha_evento ASC`, [enc.id_envio]
    );

    return res.json({
      code: enc.tracking_code,
      status: estados.find(s => s.id_estado_envio === enc.id_estado_actual)?.nombre || 'desconocido',
      progress,
      checkpoints: hist.map(h => ({ ts: h.fecha_evento, text: `${h.estado}${h.nota ? ` · ${h.nota}` : ''}` })),
    });
  } catch (e) {
    console.error('getTrackingByCode:', e.message);
    res.status(500).json({ message: 'Error al consultar tracking' });
  }
};

// GET /envios/estados
const getEstadosEnvio = async (_req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM estados_envio WHERE activo=1 ORDER BY orden, nombre`);
    res.json(rows);
  } catch (e) {
    console.error('getEstadosEnvio:', e.message);
    res.status(500).json({ message: 'Error al obtener estados' });
  }
};

// POST /envios/estados  { nombre, orden? }
const createEstadoEnvio = async (req, res) => {
  try {
    const { nombre, orden } = req.body;
    if (!nombre) return res.status(400).json({ message: 'nombre requerido' });
    const [r] = await db.query(`INSERT INTO estados_envio (nombre, orden) VALUES (?, ?)`, [nombre, Number(orden) || 99]);
    res.status(201).json({ id_estado_envio: r.insertId, nombre });
  } catch (e) {
    console.error('createEstadoEnvio:', e.message);
    res.status(500).json({ message: 'Error al crear estado' });
  }
};

// GET /envios/seguimiento?q=cliente&dpi=...&code=...
const buscarEnvios = async (req, res) => {
  try {
    const { q, dpi, code } = req.query;
    let sql = `SELECT e.id_envio, e.fecha, e.tracking_code, e.total, es.nombre AS estado, c.nombre AS cliente, c.dpi
               FROM envios e
               INNER JOIN clientes c ON c.id_cliente=e.id_cliente
               LEFT JOIN estados_envio es ON es.id_estado_envio=e.id_estado_actual
               WHERE 1=1`;
    const params = [];
    if (q) { sql += ` AND c.nombre LIKE ?`; params.push(`%${q}%`); }
    if (dpi) { sql += ` AND c.dpi = ?`; params.push(dpi); }
    if (code) { sql += ` AND e.tracking_code = ?`; params.push(code); }
    sql += ` ORDER BY e.id_envio DESC LIMIT 50`;
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('buscarEnvios:', e.message);
    res.status(500).json({ message: 'Error al buscar envíos' });
  }
};

// POST /envios/:id/estado { id_estado_envio?, nombre?, nota? , createIfMissing? }
const agregarEstadoEnvio = async (req, res) => {
  const id_envio = Number(req.params.id);
  if (!id_envio) return res.status(400).json({ message: 'id_envio inválido' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let { id_estado_envio, nombre, nota, createIfMissing } = req.body || {};
    let estadoId = Number(id_estado_envio) || null;
    if (!estadoId && nombre) {
      nombre = String(nombre).trim();
      const [[ex]] = await conn.query(`SELECT id_estado_envio FROM estados_envio WHERE nombre=?`, [nombre]);
      if (ex) estadoId = ex.id_estado_envio;
      else if (createIfMissing) {
        const [r] = await conn.query(`INSERT INTO estados_envio (nombre, orden) VALUES (?, 99)`, [nombre]);
        estadoId = r.insertId;
      }
    }
    if (!estadoId) throw new Error('Debe indicar id_estado_envio o nombre');

    await conn.query(`INSERT INTO envios_tracking (id_envio, id_estado_envio, nota) VALUES (?,?,?)`, [id_envio, estadoId, nota || null]);
    await conn.query(`UPDATE envios SET id_estado_actual=? WHERE id_envio=?`, [estadoId, id_envio]);
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    console.error('agregarEstadoEnvio:', e.message);
    res.status(500).json({ message: 'Error al actualizar estado', error: e.message });
  } finally {
    conn.release();
  }
};

module.exports = {
  getTiposEnvio,
  createTipoEnvio,
  // updates tipos
  async updateTipoEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      const { nombre, priced_by_weight, activo } = req.body || {};
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(
        `UPDATE envio_tipos SET 
           nombre = COALESCE(?, nombre),
           priced_by_weight = CASE WHEN ? IS NULL THEN priced_by_weight ELSE (?<>0) END,
           activo = CASE WHEN ? IS NULL THEN activo ELSE (?<>0) END
         WHERE id_tipo_envio=?`,
        [nombre ?? null, priced_by_weight, priced_by_weight, activo, activo, id]
      );
      res.json({ ok: true });
    } catch (e) {
      console.error('updateTipoEnvio:', e.message);
      res.status(500).json({ message: 'Error al actualizar tipo' });
    }
  },
  async deleteTipoEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(`UPDATE envio_tipos SET activo=0 WHERE id_tipo_envio=?`, [id]);
      res.json({ ok: true });
    } catch (e) {
      console.error('deleteTipoEnvio:', e.message);
      res.status(500).json({ message: 'Error al eliminar tipo' });
    }
  },
  getTarifasEnvio,
  createTarifaEnvio,
  async updateTarifaEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      const { nombre, largo_cm, ancho_cm, alto_cm, peso_base_kg, precio_base, activo } = req.body || {};
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(
        `UPDATE envio_tarifas SET
           nombre = COALESCE(?, nombre),
           largo_cm = ?,
           ancho_cm = ?,
           alto_cm = ?,
           peso_base_kg = ?,
           precio_base = COALESCE(?, precio_base),
           activo = CASE WHEN ? IS NULL THEN activo ELSE (?<>0) END
         WHERE id_tarifa_envio = ?`,
        [nombre ?? null,
         largo_cm ?? null,
         ancho_cm ?? null,
         alto_cm ?? null,
         peso_base_kg ?? null,
         precio_base ?? null,
         activo,
         activo,
         id]
      );
      res.json({ ok: true });
    } catch (e) {
      console.error('updateTarifaEnvio:', e.message);
      res.status(500).json({ message: 'Error al actualizar tarifa' });
    }
  },
  async deleteTarifaEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(`UPDATE envio_tarifas SET activo=0 WHERE id_tarifa_envio=?`, [id]);
      res.json({ ok: true });
    } catch (e) {
      console.error('deleteTarifaEnvio:', e.message);
      res.status(500).json({ message: 'Error al eliminar tarifa' });
    }
  },
  crearEnvio,
  getEnvio,
  // tracking
  getTrackingByCode,
  getEstadosEnvio,
  createEstadoEnvio,
  async updateEstadoEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      const { nombre, orden, activo } = req.body || {};
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(
        `UPDATE estados_envio SET
           nombre = COALESCE(?, nombre),
           orden = COALESCE(?, orden),
           activo = CASE WHEN ? IS NULL THEN activo ELSE (?<>0) END
         WHERE id_estado_envio = ?`,
        [nombre ?? null, orden ?? null, activo, activo, id]
      );
      res.json({ ok: true });
    } catch (e) {
      console.error('updateEstadoEnvio:', e.message);
      res.status(500).json({ message: 'Error al actualizar estado' });
    }
  },
  async deleteEstadoEnvio(req, res) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'id inválido' });
      await db.query(`UPDATE estados_envio SET activo=0 WHERE id_estado_envio=?`, [id]);
      res.json({ ok: true });
    } catch (e) {
      console.error('deleteEstadoEnvio:', e.message);
      res.status(500).json({ message: 'Error al eliminar estado' });
    }
  },
  buscarEnvios,
  agregarEstadoEnvio,
};
