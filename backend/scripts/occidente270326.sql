/*
SQLyog Ultimate v10.42 
MySQL - 11.8.6-MariaDB-log : Database - u590327588_Occidente
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `caja_aperturas` */

DROP TABLE IF EXISTS `caja_aperturas`;

CREATE TABLE `caja_aperturas` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_caja` int(11) NOT NULL,
  `id_usuario_apertura` int(11) NOT NULL,
  `fecha_apertura` datetime NOT NULL DEFAULT current_timestamp(),
  `saldo_inicial` decimal(12,2) NOT NULL DEFAULT 0.00,
  `observaciones` varchar(300) DEFAULT NULL,
  `id_usuario_cierre` int(11) DEFAULT NULL,
  `fecha_cierre` datetime DEFAULT NULL,
  `conteo_efectivo` decimal(12,2) DEFAULT NULL,
  `total_ingresos` decimal(12,2) DEFAULT NULL,
  `total_egresos` decimal(12,2) DEFAULT NULL,
  `saldo_teorico` decimal(12,2) DEFAULT NULL,
  `saldo_cierre` decimal(12,2) DEFAULT NULL,
  `diferencia` decimal(12,2) DEFAULT NULL,
  `estado` enum('ABIERTA','CERRADA') NOT NULL DEFAULT 'ABIERTA',
  PRIMARY KEY (`id`),
  KEY `fk_apertura_usuario_ap` (`id_usuario_apertura`),
  KEY `fk_apertura_usuario_ci` (`id_usuario_cierre`),
  KEY `idx_caja_aperturas_caja_estado` (`id_caja`,`estado`),
  KEY `idx_caja_aperturas_fechas` (`fecha_apertura`,`fecha_cierre`),
  CONSTRAINT `fk_apertura_caja` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id`),
  CONSTRAINT `fk_apertura_usuario_ap` FOREIGN KEY (`id_usuario_apertura`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `fk_apertura_usuario_ci` FOREIGN KEY (`id_usuario_cierre`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `caja_movimientos` */

DROP TABLE IF EXISTS `caja_movimientos`;

CREATE TABLE `caja_movimientos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_apertura` bigint(20) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT current_timestamp(),
  `tipo` enum('INGRESO','EGRESO') NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `origen` enum('VENTA','ABONO','ENVIO','MANUAL','OTRO') NOT NULL DEFAULT 'MANUAL',
  `referencia_id` bigint(20) DEFAULT NULL,
  `id_usuario` int(11) NOT NULL,
  `es_efectivo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `fk_mov_usuario` (`id_usuario`),
  KEY `idx_caja_mov_apertura` (`id_apertura`),
  KEY `idx_caja_mov_fecha` (`fecha`),
  KEY `idx_caja_mov_tipo` (`tipo`),
  KEY `idx_caja_mov_origen` (`origen`),
  CONSTRAINT `fk_mov_apertura` FOREIGN KEY (`id_apertura`) REFERENCES `caja_aperturas` (`id`),
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `cajas` */

DROP TABLE IF EXISTS `cajas`;

CREATE TABLE `cajas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cajas_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `categorias` */

DROP TABLE IF EXISTS `categorias`;

CREATE TABLE `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `clientes` */

DROP TABLE IF EXISTS `clientes`;

CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(20) DEFAULT NULL,
  `dpi` varchar(20) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `codigo_postal` varchar(10) DEFAULT NULL,
  `municipio` varchar(50) DEFAULT NULL,
  `departamento` varchar(50) DEFAULT NULL,
  `pais` varchar(3) DEFAULT 'GT',
  `tiene_credito` tinyint(1) DEFAULT 0,
  `Saldo` float(8,2) DEFAULT 0.00,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `compras` */

DROP TABLE IF EXISTS `compras`;

CREATE TABLE `compras` (
  `id_compra` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `no_factura_compra` varchar(50) DEFAULT NULL,
  `id_proveedor` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_compra`),
  KEY `id_proveedor` (`id_proveedor`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `detalle_compras` */

DROP TABLE IF EXISTS `detalle_compras`;

CREATE TABLE `detalle_compras` (
  `id_detalle_compra` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad_compra` int(11) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `precio_unitario_compra` decimal(10,2) DEFAULT NULL,
  `total_compra` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `caducidad` date DEFAULT NULL,
  PRIMARY KEY (`id_detalle_compra`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compras` (`id_compra`),
  CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `detalle_ventas` */

DROP TABLE IF EXISTS `detalle_ventas`;

CREATE TABLE `detalle_ventas` (
  `id_detalle_venta` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precio_unitario` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle_venta`),
  KEY `id_venta` (`id_venta`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=247 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `documento_frases` */

DROP TABLE IF EXISTS `documento_frases`;

CREATE TABLE `documento_frases` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_documento` int(11) NOT NULL,
  `id_frase` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_frase` (`id_frase`),
  CONSTRAINT `documento_frases_ibfk_1` FOREIGN KEY (`id_frase`) REFERENCES `frases` (`id_frase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `documentos_fel` */

DROP TABLE IF EXISTS `documentos_fel`;

CREATE TABLE `documentos_fel` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `id_venta` int(11) DEFAULT NULL,
  `uuid` varchar(50) DEFAULT NULL,
  `serie` varchar(20) DEFAULT NULL,
  `numero_documento` varchar(20) DEFAULT NULL,
  `fecha_certificacion` datetime DEFAULT NULL,
  `fecha_emision` varchar(30) DEFAULT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `xml_enviado` longtext DEFAULT NULL,
  `xml_certificado` longtext DEFAULT NULL,
  `pdf_base64` longtext DEFAULT NULL,
  `fecha_anulacion` varchar(45) DEFAULT NULL,
  `nit_cliente` varchar(20) DEFAULT NULL,
  `descripcion_anulacion` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_documento`),
  KEY `id_venta` (`id_venta`),
  CONSTRAINT `documentos_fel_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `emisores` */

DROP TABLE IF EXISTS `emisores`;

CREATE TABLE `emisores` (
  `id_emisor` int(11) NOT NULL AUTO_INCREMENT,
  `nit` varchar(15) NOT NULL,
  `nombre_fiscal` varchar(150) NOT NULL,
  `nombre_comercial` varchar(150) DEFAULT NULL,
  `afiliacion_iva` varchar(10) DEFAULT NULL,
  `correo_emisor` varchar(100) DEFAULT NULL,
  `codigo_establecimiento` varchar(10) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `municipio` varchar(50) DEFAULT NULL,
  `departamento` varchar(50) DEFAULT NULL,
  `pais` varchar(3) DEFAULT 'GT',
  PRIMARY KEY (`id_emisor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `envio_tarifas` */

DROP TABLE IF EXISTS `envio_tarifas`;

CREATE TABLE `envio_tarifas` (
  `id_tarifa_envio` int(11) NOT NULL AUTO_INCREMENT,
  `id_tipo_envio` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `largo_cm` decimal(10,2) DEFAULT NULL,
  `ancho_cm` decimal(10,2) DEFAULT NULL,
  `alto_cm` decimal(10,2) DEFAULT NULL,
  `peso_base_kg` decimal(10,2) DEFAULT NULL,
  `precio_base` decimal(12,2) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tarifa_envio`),
  KEY `fk_tarifa_tipo_envio` (`id_tipo_envio`),
  CONSTRAINT `fk_tarifa_tipo_envio` FOREIGN KEY (`id_tipo_envio`) REFERENCES `envio_tipos` (`id_tipo_envio`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `envio_tipos` */

DROP TABLE IF EXISTS `envio_tipos`;

CREATE TABLE `envio_tipos` (
  `id_tipo_envio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `priced_by_weight` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tipo_envio`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `envios` */

DROP TABLE IF EXISTS `envios`;

CREATE TABLE `envios` (
  `id_envio` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  `total` decimal(14,2) NOT NULL DEFAULT 0.00,
  `estado` varchar(30) NOT NULL DEFAULT 'CREADO',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `tracking_code` varchar(40) DEFAULT NULL,
  `id_estado_actual` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_envio`),
  UNIQUE KEY `uq_tracking_code` (`tracking_code`),
  KEY `fk_envio_cliente` (`id_cliente`),
  KEY `idx_estado_actual` (`id_estado_actual`),
  CONSTRAINT `fk_envio_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_envios_estado_actual` FOREIGN KEY (`id_estado_actual`) REFERENCES `estados_envio` (`id_estado_envio`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `envios_detalle` */

DROP TABLE IF EXISTS `envios_detalle`;

CREATE TABLE `envios_detalle` (
  `id_detalle_envio` int(11) NOT NULL AUTO_INCREMENT,
  `id_envio` int(11) NOT NULL,
  `id_tipo_envio` int(11) NOT NULL,
  `id_tarifa_envio` int(11) DEFAULT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `cantidad` decimal(12,2) NOT NULL DEFAULT 1.00,
  `peso_kg` decimal(12,2) DEFAULT NULL,
  `precio_unitario` decimal(14,2) NOT NULL,
  `total_linea` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id_detalle_envio`),
  KEY `fk_det_envio` (`id_envio`),
  KEY `fk_det_tipo_envio` (`id_tipo_envio`),
  KEY `fk_det_tarifa_envio` (`id_tarifa_envio`),
  CONSTRAINT `fk_det_envio` FOREIGN KEY (`id_envio`) REFERENCES `envios` (`id_envio`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_det_tarifa_envio` FOREIGN KEY (`id_tarifa_envio`) REFERENCES `envio_tarifas` (`id_tarifa_envio`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_det_tipo_envio` FOREIGN KEY (`id_tipo_envio`) REFERENCES `envio_tipos` (`id_tipo_envio`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `envios_tracking` */

DROP TABLE IF EXISTS `envios_tracking`;

CREATE TABLE `envios_tracking` (
  `id_tracking` int(11) NOT NULL AUTO_INCREMENT,
  `id_envio` int(11) NOT NULL,
  `id_estado_envio` int(11) NOT NULL,
  `nota` varchar(255) DEFAULT NULL,
  `fecha_evento` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tracking`),
  KEY `idx_et_envio` (`id_envio`),
  KEY `idx_et_estado` (`id_estado_envio`),
  CONSTRAINT `fk_et_envio` FOREIGN KEY (`id_envio`) REFERENCES `envios` (`id_envio`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_et_estado` FOREIGN KEY (`id_estado_envio`) REFERENCES `estados_envio` (`id_estado_envio`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `estados_envio` */

DROP TABLE IF EXISTS `estados_envio`;

CREATE TABLE `estados_envio` (
  `id_estado_envio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_estado_envio`),
  UNIQUE KEY `uq_estado_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `frases` */

DROP TABLE IF EXISTS `frases`;

CREATE TABLE `frases` (
  `id_frase` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_frase` int(11) NOT NULL,
  `codigo_escenario` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_frase`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `historial_saldos` */

DROP TABLE IF EXISTS `historial_saldos`;

CREATE TABLE `historial_saldos` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_cliente` int(11) NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `tipo_movimiento` enum('VENTA_CREDITO','ABONO','AJUSTE') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `saldo_resultante` decimal(10,2) NOT NULL,
  `observaciones` text DEFAULT NULL,
  PRIMARY KEY (`id_historial`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `historial_saldos_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `menus` */

DROP TABLE IF EXISTS `menus`;

CREATE TABLE `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `ruta` varchar(120) NOT NULL,
  `icono` varchar(120) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `grupo` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `monedas` */

DROP TABLE IF EXISTS `monedas`;

CREATE TABLE `monedas` (
  `id_moneda` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_iso` varchar(3) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_moneda`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `papeleria` */

DROP TABLE IF EXISTS `papeleria`;

CREATE TABLE `papeleria` (
  `id_papeleria` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_cliente` bigint(20) NOT NULL,
  `id_tipo_doc` bigint(20) NOT NULL,
  `nombre_documento` varchar(200) NOT NULL,
  `documento_url` varchar(600) DEFAULT NULL,
  `storage_path` varchar(600) DEFAULT NULL,
  `id_archivo` bigint(20) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `fecha_carga` datetime DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_papeleria`),
  UNIQUE KEY `uq_papeleria_cliente_tipo` (`id_cliente`,`id_tipo_doc`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `productos` */

DROP TABLE IF EXISTS `productos`;

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL AUTO_INCREMENT,
  `Codigo` varchar(100) DEFAULT NULL,
  `descripcion` varchar(150) NOT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT NULL,
  `precio_venta` decimal(10,2) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `cantidad_inicial` int(11) DEFAULT NULL,
  `nivel_minimo` int(11) DEFAULT NULL,
  `tipo` varchar(1) DEFAULT 'B',
  PRIMARY KEY (`id_producto`),
  KEY `fk_categoria` (`id_categoria`),
  CONSTRAINT `fk_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `proveedores` */

DROP TABLE IF EXISTS `proveedores`;

CREATE TABLE `proveedores` (
  `id_proveedor` int(11) NOT NULL AUTO_INCREMENT,
  `nit` varchar(20) NOT NULL,
  `dpi` varchar(20) DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `rol_menu` */

DROP TABLE IF EXISTS `rol_menu`;

CREATE TABLE `rol_menu` (
  `id_rol` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  PRIMARY KEY (`id_rol`,`id_menu`),
  KEY `id_menu` (`id_menu`),
  CONSTRAINT `rol_menu_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`),
  CONSTRAINT `rol_menu_ibfk_2` FOREIGN KEY (`id_menu`) REFERENCES `menus` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `roles` */

DROP TABLE IF EXISTS `roles`;

CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `series_compra` */

DROP TABLE IF EXISTS `series_compra`;

CREATE TABLE `series_compra` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_compra` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `serie` varchar(100) DEFAULT NULL,
  `estado` varchar(25) DEFAULT '1',
  `id_venta` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `id_compra` (`id_compra`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `series_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compras` (`id_compra`),
  CONSTRAINT `series_compra_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=194 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `series_productos` */

DROP TABLE IF EXISTS `series_productos`;

CREATE TABLE `series_productos` (
  `id_serie` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `serie` varchar(100) NOT NULL,
  `estado` enum('Disponible','Vendida') DEFAULT 'Disponible',
  PRIMARY KEY (`id_serie`),
  UNIQUE KEY `serie` (`serie`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `series_productos_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `series_vendidas` */

DROP TABLE IF EXISTS `series_vendidas`;

CREATE TABLE `series_vendidas` (
  `id_venta` int(11) NOT NULL,
  `id_serie` int(11) NOT NULL,
  PRIMARY KEY (`id_venta`,`id_serie`),
  KEY `id_serie` (`id_serie`),
  CONSTRAINT `series_vendidas_ibfk_1` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id_venta`),
  CONSTRAINT `series_vendidas_ibfk_2` FOREIGN KEY (`id_serie`) REFERENCES `series_productos` (`id_serie`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `slider_images` */

DROP TABLE IF EXISTS `slider_images`;

CREATE TABLE `slider_images` (
  `id_slider` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(120) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_slider`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `support_conversations` */

DROP TABLE IF EXISTS `support_conversations`;

CREATE TABLE `support_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_user_id` bigint(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'OPEN',
  `claimed_by_user_id` int(11) DEFAULT NULL,
  `claimed_by_username` varchar(100) DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `last_message_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conv_user` (`telegram_user_id`),
  KEY `idx_conv_status` (`status`,`last_message_at`),
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `support_messages` */

DROP TABLE IF EXISTS `support_messages`;

CREATE TABLE `support_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `direction` varchar(8) NOT NULL,
  `body` text NOT NULL,
  `agent_user_id` int(11) DEFAULT NULL,
  `agent_username` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv` (`conversation_id`,`created_at`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `telegram_support_map` */

DROP TABLE IF EXISTS `telegram_support_map`;

CREATE TABLE `telegram_support_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `support_message_id` bigint(20) NOT NULL,
  `telegram_user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_support_msg` (`support_message_id`),
  KEY `idx_support_user` (`telegram_user_id`),
  CONSTRAINT `fk_support_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `telegram_tracking_subscriptions` */

DROP TABLE IF EXISTS `telegram_tracking_subscriptions`;

CREATE TABLE `telegram_tracking_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_user_id` bigint(20) NOT NULL,
  `tracking_code` varchar(100) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sub` (`telegram_user_id`,`tracking_code`),
  KEY `idx_tracking` (`tracking_code`),
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `telegram_users` */

DROP TABLE IF EXISTS `telegram_users`;

CREATE TABLE `telegram_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_user_id` bigint(20) NOT NULL,
  `chat_id` bigint(20) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `first_name` varchar(120) DEFAULT NULL,
  `last_name` varchar(120) DEFAULT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `dpi` varchar(50) DEFAULT NULL,
  `state` varchar(40) NOT NULL DEFAULT 'idle',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_telegram_user` (`telegram_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*Table structure for table `tipo_documento` */

DROP TABLE IF EXISTS `tipo_documento`;

CREATE TABLE `tipo_documento` (
  `id_tipo_doc` bigint(20) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id_tipo_doc`),
  UNIQUE KEY `uq_tipo_documento_nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `usuario_rol` */

DROP TABLE IF EXISTS `usuario_rol`;

CREATE TABLE `usuario_rol` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_rol_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `usuario_rol_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `usuarios` */

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(120) DEFAULT NULL,
  `hash_password` varchar(255) NOT NULL,
  `estado` tinyint(4) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ventas` */

DROP TABLE IF EXISTS `ventas`;

CREATE TABLE `ventas` (
  `id_venta` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_venta` datetime DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `tipo_venta` varchar(20) DEFAULT NULL,
  `id_moneda` int(11) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id_venta`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_moneda` (`id_moneda`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`id_moneda`) REFERENCES `monedas` (`id_moneda`)
) ENGINE=InnoDB AUTO_INCREMENT=286 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `v_caja_saldos` */

DROP TABLE IF EXISTS `v_caja_saldos`;

/*!50001 DROP VIEW IF EXISTS `v_caja_saldos` */;
/*!50001 DROP TABLE IF EXISTS `v_caja_saldos` */;

/*!50001 CREATE TABLE  `v_caja_saldos`(
 `id_apertura` bigint(20) ,
 `id_caja` int(11) ,
 `fecha_apertura` datetime ,
 `saldo_inicial` decimal(12,2) ,
 `ingresos` decimal(34,2) ,
 `egresos` decimal(34,2) ,
 `saldo_teorico` decimal(36,2) 
)*/;

/*View structure for view v_caja_saldos */

/*!50001 DROP TABLE IF EXISTS `v_caja_saldos` */;
/*!50001 DROP VIEW IF EXISTS `v_caja_saldos` */;

/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`u590327588_occidente`@`%` SQL SECURITY DEFINER VIEW `v_caja_saldos` AS select `a`.`id` AS `id_apertura`,`a`.`id_caja` AS `id_caja`,`a`.`fecha_apertura` AS `fecha_apertura`,`a`.`saldo_inicial` AS `saldo_inicial`,coalesce(sum(case when `m`.`tipo` = 'INGRESO' then `m`.`monto` else 0 end),0) AS `ingresos`,coalesce(sum(case when `m`.`tipo` = 'EGRESO' then `m`.`monto` else 0 end),0) AS `egresos`,`a`.`saldo_inicial` + coalesce(sum(case when `m`.`tipo` = 'INGRESO' then `m`.`monto` else 0 end),0) - coalesce(sum(case when `m`.`tipo` = 'EGRESO' then `m`.`monto` else 0 end),0) AS `saldo_teorico` from (`caja_aperturas` `a` left join `caja_movimientos` `m` on(`m`.`id_apertura` = `a`.`id`)) group by `a`.`id` */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
