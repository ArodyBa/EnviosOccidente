-- Telegram bot schema (MySQL)
-- Ejecutar UNA vez en la base de datos.

CREATE TABLE IF NOT EXISTS telegram_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  username VARCHAR(100) NULL,
  first_name VARCHAR(120) NULL,
  last_name VARCHAR(120) NULL,
  nombre VARCHAR(200) NULL,
  telefono VARCHAR(50) NULL,
  dpi VARCHAR(50) NULL,
  state VARCHAR(40) NOT NULL DEFAULT 'idle',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_telegram_user (telegram_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS telegram_tracking_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  tracking_code VARCHAR(100) NOT NULL,
  active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_sub (telegram_user_id, tracking_code),
  KEY idx_tracking (tracking_code),
  CONSTRAINT fk_sub_user FOREIGN KEY (telegram_user_id) REFERENCES telegram_users (telegram_user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS telegram_support_map (
  id INT AUTO_INCREMENT PRIMARY KEY,
  support_message_id BIGINT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_support_msg (support_message_id),
  KEY idx_support_user (telegram_user_id),
  CONSTRAINT fk_support_user FOREIGN KEY (telegram_user_id) REFERENCES telegram_users (telegram_user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Conversaciones para agentes en el panel web (claim/assign)
CREATE TABLE IF NOT EXISTS support_conversations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN | CLAIMED | CLOSED
  claimed_by_user_id INT NULL,
  claimed_by_username VARCHAR(100) NULL,
  claimed_at DATETIME NULL,
  closed_at DATETIME NULL,
  last_message_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uq_conv_user (telegram_user_id),
  KEY idx_conv_status (status, last_message_at),
  CONSTRAINT fk_conv_user FOREIGN KEY (telegram_user_id) REFERENCES telegram_users (telegram_user_id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS support_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  direction VARCHAR(8) NOT NULL, -- IN | OUT | SYS
  body TEXT NOT NULL,
  agent_user_id INT NULL,
  agent_username VARCHAR(100) NULL,
  created_at DATETIME NOT NULL,
  KEY idx_msg_conv (conversation_id, created_at),
  CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES support_conversations (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
