// scripts/createUser.js
const bcrypt = require('bcryptjs');
let raw = require('../config/db'); // asegúrate que exporte un pool de mysql2/promise

// Normaliza el export
const db =
  (raw && typeof raw.query === 'function' && raw) ||
  (raw && raw.pool && typeof raw.pool.query === 'function' && raw.pool) ||
  (raw && raw.default && typeof raw.default.query === 'function' && raw.default);

if (!db) {
  console.error('❌ config/db no exporta un pool de mysql2/promise con .query');
  console.error('Export encontrado:', raw);
  process.exit(1);
}

(async () => {
  try {
    const usuario = 'admin';
    const correo  = 'admin@demo.com';
    const plain   = 'Admin123!';
    const hash    = await bcrypt.hash(plain, 10);

    // 1) Usuario
    await db.query(
      `INSERT INTO usuarios (usuario, password, hash_password, estado)
       VALUES (?,?,?,1)
       ON DUPLICATE KEY UPDATE password=VALUES(password), hash_password=VALUES(hash_password), estado=1`,
      [usuario, correo, hash]
    );

    // 2) Rol Admin
    await db.query(`INSERT IGNORE INTO roles (id, nombre) VALUES (1,'Admin')`);

    // 3) id del usuario
    const [[u]] = await db.query(`SELECT id FROM usuarios WHERE usuario=? LIMIT 1`, [usuario]);

    // 4) Asigna rol Admin al usuario
    await db.query(`INSERT IGNORE INTO usuario_rol (id_usuario, id_rol) VALUES (?,1)`, [u.id]);

    // 5) Vincula todos los menús existentes al rol Admin
    await db.query(`
      INSERT IGNORE INTO rol_menu (id_rol, id_menu)
      SELECT 1, m.id FROM menus m
    `);

    console.log('✅ Usuario admin creado/actualizado. Usuario:', usuario, 'Pass:', plain);
    process.exit(0);
  } catch (e) {
    console.error('❌ Error creando usuario:', e);
    process.exit(1);
  }
})();
