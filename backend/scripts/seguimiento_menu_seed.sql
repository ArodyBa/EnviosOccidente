-- Menú para Seguimiento de Envíos (operaciones)
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Seguimiento Envíos', '/envios/seguimiento', 'TrackChanges', 6, 1, 'operaciones'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/envios/seguimiento');

INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta = '/envios/seguimiento'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id
  );

