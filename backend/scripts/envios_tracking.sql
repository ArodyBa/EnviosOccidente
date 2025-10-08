-- Tracking para envíos: catálogo de estados, historial y columna tracking_code

-- Catálogo de estados
CREATE TABLE IF NOT EXISTS estados_envio (
  id_estado_envio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  orden INT NOT NULL DEFAULT 1,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_estado_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed estados básicos
INSERT INTO estados_envio (nombre, orden)
SELECT * FROM (
  SELECT 'ingresado' AS nombre, 1 AS orden UNION ALL
  SELECT 'bodega', 2 UNION ALL
  SELECT 'transito', 3 UNION ALL
  SELECT 'entregado', 4
) AS s
WHERE NOT EXISTS (SELECT 1 FROM estados_envio);

-- Alter envios: tracking y estado actual
ALTER TABLE envios
  ADD COLUMN IF NOT EXISTS tracking_code VARCHAR(40) NULL,
  ADD COLUMN IF NOT EXISTS id_estado_actual INT NULL,
  ADD UNIQUE KEY uq_tracking_code (tracking_code),
  ADD KEY idx_estado_actual (id_estado_actual),
  ADD CONSTRAINT fk_envios_estado_actual FOREIGN KEY (id_estado_actual)
    REFERENCES estados_envio(id_estado_envio) ON UPDATE CASCADE ON DELETE SET NULL;

-- Historial de estados por envío
CREATE TABLE IF NOT EXISTS envios_tracking (
  id_tracking INT AUTO_INCREMENT PRIMARY KEY,
  id_envio INT NOT NULL,
  id_estado_envio INT NOT NULL,
  nota VARCHAR(255) NULL,
  fecha_evento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_et_envio FOREIGN KEY (id_envio) REFERENCES envios(id_envio)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_et_estado FOREIGN KEY (id_estado_envio) REFERENCES estados_envio(id_estado_envio)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  KEY idx_et_envio (id_envio),
  KEY idx_et_estado (id_estado_envio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

