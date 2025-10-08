-- Menús para catálogos de Envíos: Tipos y Estados

-- Tipos y Tarifas de Envío
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Tipos/ Tarifas Envío', '/catalogo/envios-tipos', 'Category', 8, 1, 'catalogo'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/catalogo/envios-tipos');

INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta = '/catalogo/envios-tipos'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id
  );

-- Estados de Envío
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Estados de Envío', '/catalogo/envios-estados', 'Flag', 9, 1, 'catalogo'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/catalogo/envios-estados');

INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta = '/catalogo/envios-estados'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id
  );

