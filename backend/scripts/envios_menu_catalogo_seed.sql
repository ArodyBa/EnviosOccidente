-- Ajustar menú de Envíos para usar ruta '/envios' y grupo 'catalogo'

-- 1) Si existe con '/envios/nuevo', actualizarlo a '/envios' y mover a 'catalogo'
UPDATE menus
SET ruta = '/envios', grupo = 'catalogo', orden = 5, activo = 1, icono = COALESCE(icono,'LocalShipping')
WHERE ruta = '/envios/nuevo';

-- 2) Si NO existe '/envios', crearlo (idempotente)
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Envíos', '/envios', 'LocalShipping', 5, 1, 'catalogo'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/envios');

-- 3) Asegurar vínculo con rol Admin (id=1)
INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta = '/envios'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id
  );

