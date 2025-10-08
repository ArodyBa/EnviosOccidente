-- Envios module (MariaDB)
-- Tipos de envío y tarifas predefinidas + encabezado/detalle

-- Tabla de tipos (catálogo)
CREATE TABLE IF NOT EXISTS envio_tipos (
  id_tipo_envio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  priced_by_weight TINYINT(1) NOT NULL DEFAULT 0, -- 1 = precio por peso (kg)
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de tarifas predefinidas por tipo
CREATE TABLE IF NOT EXISTS envio_tarifas (
  id_tarifa_envio INT AUTO_INCREMENT PRIMARY KEY,
  id_tipo_envio INT NOT NULL,
  nombre VARCHAR(120) NOT NULL, -- Ej. "18x18x18", "TV 32\"", "Pasaporte"
  largo_cm DECIMAL(10,2) NULL,
  ancho_cm DECIMAL(10,2) NULL,
  alto_cm DECIMAL(10,2) NULL,
  peso_base_kg DECIMAL(10,2) NULL,
  precio_base DECIMAL(12,2) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarifa_tipo_envio FOREIGN KEY (id_tipo_envio) REFERENCES envio_tipos(id_tipo_envio)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Encabezado del envío
CREATE TABLE IF NOT EXISTS envios (
  id_envio INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  id_cliente INT NOT NULL,
  observaciones VARCHAR(255) NULL,
  total DECIMAL(14,2) NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'CREADO',
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_envio_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Detalle del envío
CREATE TABLE IF NOT EXISTS envios_detalle (
  id_detalle_envio INT AUTO_INCREMENT PRIMARY KEY,
  id_envio INT NOT NULL,
  id_tipo_envio INT NOT NULL,
  id_tarifa_envio INT NULL,
  descripcion VARCHAR(200) NULL, -- opcional, libre
  cantidad DECIMAL(12,2) NOT NULL DEFAULT 1,
  peso_kg DECIMAL(12,2) NULL, -- opcional; útil si priced_by_weight=1
  precio_unitario DECIMAL(14,2) NOT NULL,
  total_linea DECIMAL(14,2) NOT NULL,
  CONSTRAINT fk_det_envio FOREIGN KEY (id_envio) REFERENCES envios(id_envio)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_det_tipo_envio FOREIGN KEY (id_tipo_envio) REFERENCES envio_tipos(id_tipo_envio)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_det_tarifa_envio FOREIGN KEY (id_tarifa_envio) REFERENCES envio_tarifas(id_tarifa_envio)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seeds (tipos)
INSERT INTO envio_tipos (nombre, priced_by_weight) VALUES
  ('Caja', 0),
  ('Electrodoméstico', 0),
  ('Documento', 0),
  ('Medicina', 0),
  ('Carga por peso', 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Seeds (tarifas)
-- Tipo Caja: tamaños y precios
INSERT INTO envio_tarifas (id_tipo_envio, nombre, largo_cm, ancho_cm, alto_cm, precio_base)
SELECT t.id_tipo_envio, '18x18x18', 18, 18, 18, 120
FROM envio_tipos t WHERE t.nombre = 'Caja' LIMIT 1;

INSERT INTO envio_tarifas (id_tipo_envio, nombre, largo_cm, ancho_cm, alto_cm, precio_base)
SELECT t.id_tipo_envio, '20x20x20', 20, 20, 20, 145
FROM envio_tipos t WHERE t.nombre = 'Caja' LIMIT 1;

-- Tipo Electrodoméstico: TV 32"
INSERT INTO envio_tarifas (id_tipo_envio, nombre, precio_base)
SELECT t.id_tipo_envio, 'TV 32"', 110
FROM envio_tipos t WHERE t.nombre = 'Electrodoméstico' LIMIT 1;

-- Tipo Documento: Pasaporte
INSERT INTO envio_tarifas (id_tipo_envio, nombre, precio_base)
SELECT t.id_tipo_envio, 'Pasaporte', 1000
FROM envio_tipos t WHERE t.nombre = 'Documento' LIMIT 1;

-- Tipo carga por peso (precio por kg base 25, ejemplo)
INSERT INTO envio_tarifas (id_tipo_envio, nombre, peso_base_kg, precio_base)
SELECT t.id_tipo_envio, 'Tarifa por kg', 1, 25
FROM envio_tipos t WHERE t.nombre = 'Carga por peso' LIMIT 1;

