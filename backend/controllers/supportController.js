const db = require("../config/db");
const { sendAgentReplyToUser, sendMainMenuToTelegramUser } = require("../services/telegram");

const asInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function listConversations(req, res) {
  try {
    const status = String(req.query.status || "open").toUpperCase();
    const where =
      status === "ALL"
        ? "1=1"
        : status === "CLAIMED"
        ? "sc.status='CLAIMED'"
        : status === "CLOSED"
        ? "sc.status='CLOSED'"
        : "sc.status IN ('OPEN','CLAIMED')";

    const [rows] = await db.query(
      `SELECT sc.id, sc.status, sc.claimed_by_user_id, sc.claimed_by_username, sc.claimed_at,
              sc.last_message_at, sc.created_at,
              tu.telegram_user_id, tu.username, tu.nombre, tu.telefono, tu.dpi
         FROM support_conversations sc
         INNER JOIN telegram_users tu ON tu.telegram_user_id=sc.telegram_user_id
        WHERE ${where}
        ORDER BY COALESCE(sc.last_message_at, sc.created_at) DESC
        LIMIT 100`
    );
    res.json(rows || []);
  } catch (e) {
    console.error("support listConversations:", e.message);
    res.status(500).json({ message: "Error listando conversaciones" });
  }
}

async function getMessages(req, res) {
  try {
    const id = asInt(req.params.id);
    if (!id) return res.status(400).json({ message: "id inválido" });
    const [rows] = await db.query(
      `SELECT id, direction, body, agent_user_id, agent_username, created_at
         FROM support_messages
        WHERE conversation_id=?
        ORDER BY created_at ASC
        LIMIT 500`,
      [id]
    );
    res.json(rows || []);
  } catch (e) {
    console.error("support getMessages:", e.message);
    res.status(500).json({ message: "Error obteniendo mensajes" });
  }
}

async function claimConversation(req, res) {
  const convId = asInt(req.params.id);
  if (!convId) return res.status(400).json({ message: "id inválido" });
  const agentUserId = asInt(req.user?.sub);
  const agentUsername = String(req.user?.usuario || "agente");
  try {
    const [r] = await db.query(
      `UPDATE support_conversations
          SET status='CLAIMED',
              claimed_by_user_id=?,
              claimed_by_username=?,
              claimed_at=NOW(),
              updated_at=NOW()
        WHERE id=?
          AND status IN ('OPEN','CLAIMED')
          AND (claimed_by_user_id IS NULL OR claimed_by_user_id=?)`,
      [agentUserId, agentUsername, convId, agentUserId]
    );
    if (!r.affectedRows) {
      return res.status(409).json({
        message:
          "Esta conversación ya fue aceptada por otro agente o no está disponible.",
      });
    }
    res.json({ ok: true });
  } catch (e) {
    console.error("support claimConversation:", e.message);
    res.status(500).json({ message: "Error aceptando conversación" });
  }
}

async function closeConversation(req, res) {
  const convId = asInt(req.params.id);
  if (!convId) return res.status(400).json({ message: "id inválido" });
  const agentUserId = asInt(req.user?.sub);
  try {
    const [[conv]] = await db.query(
      `SELECT claimed_by_user_id, telegram_user_id FROM support_conversations WHERE id=? LIMIT 1`,
      [convId]
    );
    if (!conv) return res.status(404).json({ message: "No encontrado" });
    if (conv.claimed_by_user_id && conv.claimed_by_user_id !== agentUserId) {
      return res.status(403).json({
        message: "Solo el agente asignado puede cerrar la conversación.",
      });
    }
    await db.query(
      `UPDATE support_conversations
          SET status='CLOSED', closed_at=NOW(), updated_at=NOW()
        WHERE id=?`,
      [convId]
    );
    // Regresa el usuario al menú normal en Telegram
    if (conv.telegram_user_id) {
      await db.query(
        `UPDATE telegram_users SET state='idle', updated_at=NOW() WHERE telegram_user_id=?`,
        [String(conv.telegram_user_id)]
      );
      await sendMainMenuToTelegramUser(
        conv.telegram_user_id,
        "✅ Chat finalizado por el agente. Puedes consultar tracking u otras opciones en el menú."
      ).catch(() => {});
    }
    await db.query(
      `INSERT INTO support_messages (conversation_id, direction, body, agent_user_id, agent_username, created_at)
       VALUES (?, 'SYS', 'Conversación cerrada', ?, ?, NOW())`,
      [convId, agentUserId, String(req.user?.usuario || "agente")]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("support closeConversation:", e.message);
    res.status(500).json({ message: "Error cerrando conversación" });
  }
}

async function sendMessage(req, res) {
  const convId = asInt(req.params.id);
  const body = String(req.body?.body || "").trim();
  if (!convId) return res.status(400).json({ message: "id inválido" });
  if (!body) return res.status(400).json({ message: "body requerido" });

  const agentUserId = asInt(req.user?.sub);
  const agentUsername = String(req.user?.usuario || "agente");

  try {
    const [[conv]] = await db.query(
      `SELECT telegram_user_id, claimed_by_user_id, status
         FROM support_conversations
        WHERE id=? LIMIT 1`,
      [convId]
    );
    if (!conv) return res.status(404).json({ message: "No encontrado" });
    if (conv.status === "CLOSED") {
      return res.status(409).json({ message: "Conversación cerrada." });
    }
    if (!conv.claimed_by_user_id) {
      return res.status(409).json({
        message: "Primero debes aprobar/aceptar la conversación.",
      });
    }
    if (conv.claimed_by_user_id !== agentUserId) {
      return res.status(403).json({
        message: "Solo el agente asignado puede enviar mensajes.",
      });
    }

    await db.query(
      `INSERT INTO support_messages (conversation_id, direction, body, agent_user_id, agent_username, created_at)
       VALUES (?, 'OUT', ?, ?, ?, NOW())`,
      [convId, body, agentUserId, agentUsername]
    );
    await db.query(
      `UPDATE support_conversations SET last_message_at=NOW(), updated_at=NOW() WHERE id=?`,
      [convId]
    );

    await sendAgentReplyToUser({
      telegramUserId: conv.telegram_user_id,
      agentUsername,
      text: body,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error("support sendMessage:", e.message);
    res.status(500).json({ message: "Error enviando mensaje" });
  }
}

module.exports = {
  listConversations,
  getMessages,
  claimConversation,
  closeConversation,
  sendMessage,
};
