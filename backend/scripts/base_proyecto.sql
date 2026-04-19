/*
  Base de proyecto (MariaDB/MySQL)
  - Autenticación: usuarios / roles / usuario_rol
  - Menú dinámico por rol: menus / rol_menu
  - Empresa: empresa (datos generales)
  - Landing: slider_images
  - Telegram soporte/tracking: telegram_users + tablas relacionadas

  Nota:
  - Esto crea la base mínima para que el backend pueda hacer login y devolver menús.
  - Si vas a usar el script scripts/createUser.js, este esquema es compatible.
*/

/*!40101 SET NAMES utf8mb4 */;
/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

/*
  ========= (Opcional) DB user =========
  -- Ajusta usuario/host/clave según tu entorno
  -- CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'cambia_esta_clave';
  -- GRANT ALL PRIVILEGES ON tu_basedatos.* TO 'app_user'@'%';
  -- FLUSH PRIVILEGES;
*/

/* =========================
   Seguridad (roles/usuarios)
   ========================= */

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password` varchar(120) DEFAULT NULL,
  `hash_password` varchar(255) NOT NULL,
  `estado` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_usuarios_usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `usuario_rol` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `idx_usuario_rol_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_usuario_rol_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Permisos (opcional/base)
   =========================
   El backend actual usa roles + menú por rol.
   Estas tablas sirven como base para permisos finos si luego los implementas.
*/

CREATE TABLE IF NOT EXISTS `permisos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(80) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permisos_clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rol_permiso` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `idx_rol_permiso_permiso` (`id_permiso`),
  CONSTRAINT `fk_rol_permiso_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rol_permiso_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Menús (admin básico)
   ========================= */

CREATE TABLE IF NOT EXISTS `menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `ruta` varchar(120) NOT NULL,
  `icono` varchar(120) DEFAULT NULL,
  `orden` int(11) DEFAULT 0,
  `activo` tinyint(4) NOT NULL DEFAULT 1,
  `grupo` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_menus_ruta` (`ruta`),
  KEY `idx_menus_activo_orden` (`activo`,`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rol_menu` (
  `id_rol` int(11) NOT NULL,
  `id_menu` int(11) NOT NULL,
  PRIMARY KEY (`id_rol`,`id_menu`),
  KEY `idx_rol_menu_menu` (`id_menu`),
  CONSTRAINT `fk_rol_menu_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rol_menu_menu` FOREIGN KEY (`id_menu`) REFERENCES `menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Empresa (config del negocio)
   ========================= */

CREATE TABLE IF NOT EXISTS `empresa` (
  `id_empresa` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_comercial` varchar(150) NOT NULL,
  `razon_social` varchar(180) DEFAULT NULL,
  `nit` varchar(40) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `telefono` varchar(40) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `sitio_web` varchar(160) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `pais` varchar(3) NOT NULL DEFAULT 'GT',
  `moneda` varchar(10) NOT NULL DEFAULT 'GTQ',
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_empresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Landing (slider)
   ========================= */

CREATE TABLE IF NOT EXISTS `slider_images` (
  `id_slider` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(120) DEFAULT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `orden` int(11) NOT NULL DEFAULT 1,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_slider`),
  KEY `idx_slider_activo_orden` (`activo`,`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Telegram (soporte + tracking)
   ========================= */

CREATE TABLE IF NOT EXISTS `telegram_users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `telegram_tracking_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_user_id` bigint(20) NOT NULL,
  `tracking_code` varchar(100) NOT NULL,
  `active` tinyint(4) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sub` (`telegram_user_id`,`tracking_code`),
  KEY `idx_tracking` (`tracking_code`),
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `telegram_support_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `support_message_id` bigint(20) NOT NULL,
  `telegram_user_id` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_support_msg` (`support_message_id`),
  KEY `idx_support_user` (`telegram_user_id`),
  CONSTRAINT `fk_support_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_conversations` (
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
  KEY `idx_conv_claimed_by` (`claimed_by_user_id`),
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`telegram_user_id`) REFERENCES `telegram_users` (`telegram_user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_agent` FOREIGN KEY (`claimed_by_user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `direction` varchar(8) NOT NULL,
  `body` text NOT NULL,
  `agent_user_id` int(11) DEFAULT NULL,
  `agent_username` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv` (`conversation_id`,`created_at`),
  KEY `idx_msg_agent` (`agent_user_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `support_conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_agent` FOREIGN KEY (`agent_user_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/* =========================
   Seeds mínimos (Admin)
   ========================= */

-- Rol Admin (id 1)
INSERT IGNORE INTO `roles` (`id`, `nombre`) VALUES (1, 'Admin');

-- Usuario admin (usuario: admin / pass: Admin123!)
-- hash bcrypt reutilizado (compatible con bcryptjs.compare)
INSERT INTO `usuarios` (`id`, `usuario`, `password`, `hash_password`, `estado`)
VALUES (1, 'admin', 'admin@demo.com', '$2b$10$HBOX8ngeU4Zu6sLlD86Nbu8aVcvinszfZzDhBK8rc9x4q8mqLjpJu', 1)
ON DUPLICATE KEY UPDATE
  `password`=VALUES(`password`),
  `hash_password`=VALUES(`hash_password`),
  `estado`=VALUES(`estado`);

INSERT IGNORE INTO `usuario_rol` (`id_usuario`, `id_rol`) VALUES (1, 1);

-- Menús base (ajusta rutas/iconos a tu frontend)
INSERT INTO `menus` (`nombre`, `ruta`, `icono`, `orden`, `activo`, `grupo`)
SELECT 'Dashboard', '/dashboard', 'DashboardRounded', 1, 1, 'general'
WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `ruta`='/dashboard');

INSERT INTO `menus` (`nombre`, `ruta`, `icono`, `orden`, `activo`, `grupo`)
SELECT 'Landing Slider', '/slider', 'PhotoLibraryRounded', 20, 1, 'landing'
WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `ruta`='/slider');

INSERT INTO `menus` (`nombre`, `ruta`, `icono`, `orden`, `activo`, `grupo`)
SELECT 'Soporte', '/support', 'SupportAgentRounded', 30, 1, 'soporte'
WHERE NOT EXISTS (SELECT 1 FROM `menus` WHERE `ruta`='/support');

-- Asigna TODOS los menús existentes al rol Admin
INSERT IGNORE INTO `rol_menu` (`id_rol`, `id_menu`)
SELECT 1, m.`id` FROM `menus` m;

-- Empresa por defecto (id 1)
INSERT INTO `empresa` (`id_empresa`, `nombre_comercial`, `razon_social`, `pais`, `moneda`, `activa`)
VALUES (1, 'Mi Empresa', 'Mi Empresa', 'GT', 'GTQ', 1)
ON DUPLICATE KEY UPDATE
  `nombre_comercial`=VALUES(`nombre_comercial`),
  `razon_social`=VALUES(`razon_social`),
  `pais`=VALUES(`pais`),
  `moneda`=VALUES(`moneda`),
  `activa`=VALUES(`activa`);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

