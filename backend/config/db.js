// config/db.js
const mysql = require('mysql2');
const config = require('./environment');

const pool = mysql.createPool({
  host: config.DB_HOST,
  port: config.DB_PORT || 3306,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const promisePool = pool.promise();

// (opcional) probar conexión una sola vez
promisePool.getConnection()
  .then(conn => { console.log('✅ DB OK'); conn.release(); })
  .catch(err => console.error('❌ DB ERROR:', err.message));

// 👇 OJO: exporta SOLO el pool con promesas
module.exports = promisePool;
