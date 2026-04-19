const db = require('../config/db');

function normalizeRoles(roles) {
  if (!Array.isArray(roles)) return [];
  return roles.map((r) => String(r));
}

async function fetchRolesByUserId(userId) {
  const [rows] = await db.query(
    `SELECT r.nombre
     FROM roles r
     JOIN usuario_rol ur ON ur.id_rol=r.id
     WHERE ur.id_usuario=?`,
    [userId]
  );
  return rows.map((r) => r.nombre);
}

function requireRole(roleName) {
  const required = String(roleName);

  return async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) return res.status(401).json({ message: 'No autorizado' });

      const currentRoles = normalizeRoles(req.user?.roles);
      if (currentRoles.includes(required)) return next();

      const roles = await fetchRolesByUserId(userId);
      req.user.roles = roles;
      if (!roles.includes(required)) {
        return res.status(403).json({ message: 'No permitido' });
      }

      return next();
    } catch (e) {
      console.error('requireRole error:', e);
      return res.status(500).json({ message: 'Error interno' });
    }
  };
}

module.exports = { requireRole };

