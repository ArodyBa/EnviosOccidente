-- Agregar menú y permisos (rol_menu) para el módulo Envíos
-- Seguro para ejecutar múltiples veces (usa INSERT SELECT ... WHERE NOT EXISTS)

-- 1) Menú principal: Nuevo Envío (grupo: operaciones)
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Envíos', '/envios/nuevo', 'LocalShipping', 5, 1, 'operaciones'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/envios/nuevo');

-- 2) Vincular al rol Admin (id=1) por defecto
INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta = '/envios/nuevo'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id
  );

-- OPCIONAL: si deseas catálogos visibles en el menú (UI aún no creada)
-- Tipos de Envío (grupo: catalogo)
-- INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
-- SELECT 'Tipos de Envío', '/envios/tipos', 'Category', 6, 1, 'catalogo'
-- WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/envios/tipos');
-- INSERT INTO rol_menu (id_rol, id_menu)
-- SELECT 1, m.id FROM menus m WHERE m.ruta = '/envios/tipos'
--   AND NOT EXISTS (SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id);

-- Tarifas de Envío (grupo: catalogo)
-- INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
-- SELECT 'Tarifas de Envío', '/envios/tarifas', 'PriceChange', 7, 1, 'catalogo'
-- WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta = '/envios/tarifas');
-- INSERT INTO rol_menu (id_rol, id_menu)
-- SELECT 1, m.id FROM menus m WHERE m.ruta = '/envios/tarifas'
--   AND NOT EXISTS (SELECT 1 FROM rol_menu rm WHERE rm.id_rol = 1 AND rm.id_menu = m.id);

-- Nota: si manejas otros roles, repite los INSERT a rol_menu cambiando id_rol.

