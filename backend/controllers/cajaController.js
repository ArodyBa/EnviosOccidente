// controllers/cajaController.js
const db = require('../config/db');

const parseBool = (v, d = false) => {
  if (v === undefined || v === null) return d;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const s = String(v).toLowerCase();
  return ['1', 'true', 't', 'yes', 'y', 'si', 'sí'].includes(s);
};

const getCajaId = (req) => {
  const n = Number(req.query.id_caja || req.body?.id_caja || 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

// GET /caja/apertura-actual
const getAperturaActual = async (req, res) => {
  const idCaja = getCajaId(req);
  try {
    const [[ap]] = await db.query(
      `SELECT * FROM caja_aperturas 
        WHERE id_caja=? AND estado='ABIERTA' 
        ORDER BY fecha_apertura DESC LIMIT 1`,
      [idCaja]
    );
    if (!ap) return res.json({ abierta: false });

    const [[saldo]] = await db.query(
      `SELECT a.id,
              a.saldo_inicial,
              COALESCE(SUM(CASE WHEN m.tipo='INGRESO' THEN m.monto ELSE 0 END),0) AS ingresos,
              COALESCE(SUM(CASE WHEN m.tipo='EGRESO'  THEN m.monto ELSE 0 END),0) AS egresos,
              a.saldo_inicial +
              COALESCE(SUM(CASE WHEN m.tipo='INGRESO' THEN m.monto ELSE 0 END),0) -
              COALESCE(SUM(CASE WHEN m.tipo='EGRESO'  THEN m.monto ELSE 0 END),0) AS saldo_teorico
         FROM caja_aperturas a
         LEFT JOIN caja_movimientos m ON m.id_apertura=a.id AND m.es_efectivo=1
        WHERE a.id=?
        GROUP BY a.id`,
      [ap.id]
    );

    const [movs] = await db.query(
      `SELECT id, fecha, tipo, monto, descripcion, origen, referencia_id, es_efectivo
         FROM caja_movimientos
        WHERE id_apertura=?
        ORDER BY fecha DESC, id DESC
        LIMIT 50`,
      [ap.id]
    );

    return res.json({ abierta: true, apertura: ap, saldo, movimientos: movs });
  } catch (e) {
    console.error('getAperturaActual error:', e);
    return res.status(500).json({ message: 'Error al obtener apertura actual' });
  }
};

// POST /caja/aperturas
const abrirCaja = async (req, res) => {
  const idCaja = getCajaId(req);
  const usuarioId = req.user?.sub;
  const saldoInicial = Number(req.body?.saldo_inicial ?? 0);
  const observaciones = req.body?.observaciones || null;

  if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });
  if (!Number.isFinite(saldoInicial) || saldoInicial < 0) {
    return res.status(400).json({ message: 'saldo_inicial inválido' });
  }

  try {
    const [[existe]] = await db.query(
      `SELECT id FROM caja_aperturas WHERE id_caja=? AND estado='ABIERTA' LIMIT 1`,
      [idCaja]
    );
    if (existe) return res.status(409).json({ message: 'Ya existe una apertura ABIERTA para esta caja' });

    const [ins] = await db.query(
      `INSERT INTO caja_aperturas (id_caja, id_usuario_apertura, saldo_inicial, observaciones)
       VALUES (?, ?, ?, ?)`,
      [idCaja, usuarioId, saldoInicial, observaciones]
    );

    const [[row]] = await db.query(`SELECT * FROM caja_aperturas WHERE id=?`, [ins.insertId]);
    return res.json({ message: 'Caja abierta', apertura: row });
  } catch (e) {
    console.error('abrirCaja error:', e);
    return res.status(500).json({ message: 'Error al abrir caja' });
  }
};

// POST /caja/movimientos
const crearMovimiento = async (req, res) => {
  const idCaja = getCajaId(req);
  const usuarioId = req.user?.sub;
  let { tipo, monto, descripcion, origen, referencia_id, es_efectivo } = req.body || {};

  if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });
  tipo = String(tipo || '').toUpperCase();
  if (!['INGRESO', 'EGRESO'].includes(tipo)) return res.status(400).json({ message: 'tipo inválido' });
  monto = Number(monto);
  if (!Number.isFinite(monto) || monto <= 0) return res.status(400).json({ message: 'monto inválido' });
  origen = (origen || 'MANUAL').toUpperCase();
  if (!['VENTA', 'ABONO', 'ENVIO', 'MANUAL', 'OTRO'].includes(origen)) origen = 'MANUAL';
  es_efectivo = parseBool(es_efectivo, true) ? 1 : 0;

  try {
    const [[ap]] = await db.query(
      `SELECT id FROM caja_aperturas WHERE id_caja=? AND estado='ABIERTA' LIMIT 1`,
      [idCaja]
    );
    if (!ap) return res.status(409).json({ message: 'No hay caja abierta' });

    const [ins] = await db.query(
      `INSERT INTO caja_movimientos (id_apertura, tipo, monto, descripcion, origen, referencia_id, id_usuario, es_efectivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ap.id, tipo, monto, descripcion || null, origen, referencia_id || null, usuarioId, es_efectivo]
    );

    const [[mov]] = await db.query(`SELECT * FROM caja_movimientos WHERE id=?`, [ins.insertId]);
    return res.json({ message: 'Movimiento registrado', movimiento: mov });
  } catch (e) {
    console.error('crearMovimiento error:', e);
    return res.status(500).json({ message: 'Error al registrar movimiento' });
  }
};

// POST /caja/cierre
const cerrarCaja = async (req, res) => {
  const idCaja = getCajaId(req);
  const usuarioId = req.user?.sub;
  const conteo = Number(req.body?.conteo_efectivo);
  const observaciones = req.body?.observaciones || null;

  if (!usuarioId) return res.status(401).json({ message: 'No autorizado' });
  if (!Number.isFinite(conteo) || conteo < 0) return res.status(400).json({ message: 'conteo_efectivo inválido' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [[ap]] = await conn.query(
      `SELECT * FROM caja_aperturas WHERE id_caja=? AND estado='ABIERTA' LIMIT 1 FOR UPDATE`,
      [idCaja]
    );
    if (!ap) {
      await conn.rollback();
      return res.status(409).json({ message: 'No hay caja abierta' });
    }

    const [[sumas]] = await conn.query(
      `SELECT COALESCE(SUM(CASE WHEN tipo='INGRESO' THEN monto END),0) AS ingresos,
              COALESCE(SUM(CASE WHEN tipo='EGRESO'  THEN monto END),0) AS egresos
         FROM caja_movimientos
        WHERE id_apertura=? AND es_efectivo=1`,
      [ap.id]
    );

    const total_ingresos = Number(sumas.ingresos || 0);
    const total_egresos = Number(sumas.egresos || 0);
    const saldo_teorico = Number(ap.saldo_inicial) + total_ingresos - total_egresos;
    const diferencia = Number((conteo - saldo_teorico).toFixed(2));

    await conn.query(
      `UPDATE caja_aperturas
          SET id_usuario_cierre=?, fecha_cierre=NOW(), conteo_efectivo=?,
              total_ingresos=?, total_egresos=?, saldo_teorico=?,
              saldo_cierre=?, diferencia=?, estado='CERRADA', observaciones=COALESCE(?, observaciones)
        WHERE id=?`,
      [usuarioId, conteo, total_ingresos, total_egresos, saldo_teorico, conteo, diferencia, observaciones, ap.id]
    );

    await conn.commit();
    return res.json({
      message: 'Caja cerrada',
      cierre: {
        id_apertura: ap.id,
        total_ingresos,
        total_egresos,
        saldo_teorico,
        saldo_cierre: conteo,
        diferencia,
      },
    });
  } catch (e) {
    await conn.rollback();
    console.error('cerrarCaja error:', e);
    return res.status(500).json({ message: 'Error al cerrar caja' });
  } finally {
    conn.release();
  }
};

// GET /caja/movimientos
const listarMovimientos = async (req, res) => {
  const idCaja = getCajaId(req);
  const { desde, hasta, tipo, origen } = req.query;
  const esEfectivo = req.query.es_efectivo;

  try {
    const [[ap]] = await db.query(
      `SELECT id FROM caja_aperturas WHERE id_caja=? AND estado='ABIERTA' LIMIT 1`,
      [idCaja]
    );
    if (!ap) return res.status(409).json({ message: 'No hay caja abierta' });

    const params = [ap.id];
    const where = ['id_apertura=?'];
    if (tipo && ['INGRESO', 'EGRESO'].includes(String(tipo).toUpperCase())) {
      where.push('tipo=?');
      params.push(String(tipo).toUpperCase());
    }
    if (origen) {
      where.push('origen=?');
      params.push(String(origen).toUpperCase());
    }
    if (desde) { where.push('fecha >= ?'); params.push(desde); }
    if (hasta) { where.push('fecha <= ?'); params.push(hasta); }
    if (esEfectivo !== undefined) { where.push('es_efectivo=?'); params.push(parseBool(esEfectivo, true) ? 1 : 0); }

    const [rows] = await db.query(
      `SELECT id, fecha, tipo, monto, descripcion, origen, referencia_id, es_efectivo
         FROM caja_movimientos
        WHERE ${where.join(' AND ')}
        ORDER BY fecha DESC, id DESC`,
      params
    );
    return res.json(rows);
  } catch (e) {
    console.error('listarMovimientos error:', e);
    return res.status(500).json({ message: 'Error al listar movimientos' });
  }
};

// GET /caja/resumen?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&agrupacion=diario|semanal|mensual
const resumen = async (req, res) => {
  const { desde, hasta } = req.query;
  const agrupacion = (req.query.agrupacion || 'diario').toLowerCase();
  const esEfectivo = parseBool(req.query.es_efectivo, true) ? 1 : 0;

  let campoPeriodo;
  if (agrupacion === 'semanal') {
    campoPeriodo = "CONCAT(YEARWEEK(fecha, 1))"; // e.g., 202545
  } else if (agrupacion === 'mensual') {
    campoPeriodo = "DATE_FORMAT(fecha, '%Y-%m')"; // e.g., 2025-10
  } else {
    campoPeriodo = 'DATE(fecha)';
  }

  const where = ['es_efectivo=?'];
  const params = [esEfectivo];
  if (desde) { where.push('fecha >= ?'); params.push(desde); }
  if (hasta) { where.push('fecha <= ?'); params.push(hasta); }

  try {
    const [rows] = await db.query(
      `SELECT ${campoPeriodo} AS periodo,
              SUM(CASE WHEN tipo='INGRESO' THEN monto ELSE 0 END) AS ingresos,
              SUM(CASE WHEN tipo='EGRESO'  THEN monto ELSE 0 END) AS egresos
         FROM caja_movimientos
        WHERE ${where.join(' AND ')}
        GROUP BY ${campoPeriodo}
        ORDER BY periodo`,
      params
    );
    return res.json(rows);
  } catch (e) {
    console.error('resumen error:', e);
    return res.status(500).json({ message: 'Error al obtener resumen' });
  }
};

module.exports = {
  getAperturaActual,
  abrirCaja,
  crearMovimiento,
  cerrarCaja,
  listarMovimientos,
  resumen,
};

