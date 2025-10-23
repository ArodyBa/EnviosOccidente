-- Caja (Apertura, Movimientos, Cierre)
-- Ejecutar dentro de tu base de datos actual
-- Diseñado para MariaDB/MySQL 10+

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- Tabla opcional si manejas varias cajas. Si solo usas una, se crea un registro por defecto.
CREATE TABLE IF NOT EXISTS cajas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_cajas_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cajas (nombre, activa)
SELECT 'Caja Principal', 1
WHERE NOT EXISTS (SELECT 1 FROM cajas);

-- Sesiones de caja (apertura y cierre)
CREATE TABLE IF NOT EXISTS caja_aperturas (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_caja INT NOT NULL,
  id_usuario_apertura INT NOT NULL,
  fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  saldo_inicial DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  observaciones VARCHAR(300) NULL,

  -- Datos de cierre (nulos mientras esté abierta)
  id_usuario_cierre INT NULL,
  fecha_cierre DATETIME NULL,
  conteo_efectivo DECIMAL(12,2) NULL,
  total_ingresos DECIMAL(12,2) NULL,
  total_egresos DECIMAL(12,2) NULL,
  saldo_teorico DECIMAL(12,2) NULL,
  saldo_cierre DECIMAL(12,2) NULL,
  diferencia DECIMAL(12,2) NULL,
  estado ENUM('ABIERTA','CERRADA') NOT NULL DEFAULT 'ABIERTA',

  CONSTRAINT fk_apertura_caja FOREIGN KEY (id_caja) REFERENCES cajas(id),
  CONSTRAINT fk_apertura_usuario_ap FOREIGN KEY (id_usuario_apertura) REFERENCES usuarios(id),
  CONSTRAINT fk_apertura_usuario_ci FOREIGN KEY (id_usuario_cierre) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_caja_aperturas_caja_estado ON caja_aperturas (id_caja, estado);
CREATE INDEX idx_caja_aperturas_fechas ON caja_aperturas (fecha_apertura, fecha_cierre);

-- Movimientos vinculados a una apertura
CREATE TABLE IF NOT EXISTS caja_movimientos (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  id_apertura BIGINT NOT NULL,
  fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  tipo ENUM('INGRESO','EGRESO') NOT NULL,
  monto DECIMAL(12,2) NOT NULL,
  descripcion VARCHAR(300) NULL,

  -- Origen del movimiento (para trazabilidad)
  origen ENUM('VENTA','ABONO','ENVIO','MANUAL','OTRO') NOT NULL DEFAULT 'MANUAL',
  referencia_id BIGINT NULL,

  -- Quién registró el movimiento
  id_usuario INT NOT NULL,

  -- Solo efectivo o registrar todo y filtrar después; este flag ayuda a reportes de EFECTIVO
  es_efectivo TINYINT(1) NOT NULL DEFAULT 1,

  CONSTRAINT fk_mov_apertura FOREIGN KEY (id_apertura) REFERENCES caja_aperturas(id),
  CONSTRAINT fk_mov_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_caja_mov_apertura ON caja_movimientos (id_apertura);
CREATE INDEX idx_caja_mov_fecha ON caja_movimientos (fecha);
CREATE INDEX idx_caja_mov_tipo ON caja_movimientos (tipo);
CREATE INDEX idx_caja_mov_origen ON caja_movimientos (origen);

-- Vista útil para saldos por apertura
DROP VIEW IF EXISTS v_caja_saldos;
CREATE VIEW v_caja_saldos AS
SELECT a.id            AS id_apertura,
       a.id_caja,
       a.fecha_apertura,
       a.saldo_inicial,
       COALESCE(SUM(CASE WHEN m.tipo='INGRESO' THEN m.monto ELSE 0 END),0) AS ingresos,
       COALESCE(SUM(CASE WHEN m.tipo='EGRESO'  THEN m.monto ELSE 0 END),0) AS egresos,
       a.saldo_inicial +
       COALESCE(SUM(CASE WHEN m.tipo='INGRESO' THEN m.monto ELSE 0 END),0) -
       COALESCE(SUM(CASE WHEN m.tipo='EGRESO'  THEN m.monto ELSE 0 END),0) AS saldo_teorico
FROM caja_aperturas a
LEFT JOIN caja_movimientos m ON m.id_apertura=a.id
GROUP BY a.id;

-- Seed de menú para el módulo Caja (si usas tu tabla menus/rol_menu)
-- Inserta menú /caja bajo grupo 'operaciones'
INSERT INTO menus (nombre, ruta, icono, orden, activo, grupo)
SELECT 'Caja', '/caja', 'PointOfSale', 5, 1, 'operaciones'
WHERE NOT EXISTS (SELECT 1 FROM menus WHERE ruta='/caja');

-- Da acceso al rol 1 (Administrador) si existe
INSERT INTO rol_menu (id_rol, id_menu)
SELECT 1, m.id FROM menus m
WHERE m.ruta='/caja'
  AND NOT EXISTS (
    SELECT 1 FROM rol_menu rm WHERE rm.id_rol=1 AND rm.id_menu=m.id
  );

SET FOREIGN_KEY_CHECKS=1;

-- Consultas de ejemplo
-- 1) Apertura abierta por usuario/caja
-- SELECT * FROM caja_aperturas WHERE id_caja=? AND estado='ABIERTA' ORDER BY fecha_apertura DESC LIMIT 1;

-- 2) Resumen diario/semanal/mensual (solo efectivo) en un rango
-- SELECT DATE(fecha) AS periodo,
--        SUM(CASE WHEN tipo='INGRESO' THEN monto ELSE 0 END) ingresos,
--        SUM(CASE WHEN tipo='EGRESO'  THEN monto ELSE 0 END) egresos
-- FROM caja_movimientos
-- WHERE es_efectivo=1 AND fecha BETWEEN ? AND ?
-- GROUP BY DATE(fecha)
-- ORDER BY periodo;

