const db = require('../config/db');

exports.overview = async (_req, res) => {
  try {
    const [[entregados]] = await db.query(
      `SELECT COUNT(*) AS n
         FROM envios e
         LEFT JOIN estados_envio es ON es.id_estado_envio=e.id_estado_actual
        WHERE es.nombre IS NOT NULL
          AND LOWER(es.nombre) LIKE '%entreg%'`
    );

    // Incidencias: por ahora, se consideran envíos cuyo estado actual contiene "rechaz", "devuel" o "inciden".
    const [[incidencias]] = await db.query(
      `SELECT COUNT(*) AS n
         FROM envios e
         LEFT JOIN estados_envio es ON es.id_estado_envio=e.id_estado_actual
        WHERE es.nombre IS NOT NULL
          AND (
            LOWER(es.nombre) LIKE '%rechaz%'
            OR LOWER(es.nombre) LIKE '%devuel%'
            OR LOWER(es.nombre) LIKE '%inciden%'
          )`
    );

    const [[tickets]] = await db.query(
      `SELECT COUNT(*) AS n
         FROM support_conversations sc
        WHERE UPPER(sc.status) IN ('OPEN','CLAIMED')`
    );

    return res.json({
      envios_entregados: Number(entregados?.n || 0),
      incidencias_pendientes: Number(incidencias?.n || 0),
      tickets_abiertos: Number(tickets?.n || 0),
    });
  } catch (e) {
    console.error('dashboard overview error:', e);
    return res.status(500).json({ message: 'Error interno' });
  }
};

