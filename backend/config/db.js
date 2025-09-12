const mysql = require('mysql2');
const config = require('./environment');

// Crear el pool
const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Pool con promesas
const promisePool = pool.promise();

// Probar conexión
promisePool.getConnection()
  .then(conn => {
    console.log("✅ Conexión establecida con la base de datos MySQL en Hostinger");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
  });

module.exports = {
  pool,
  promisePool,
};
