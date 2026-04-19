const axios = require("axios");
const db = require("../config/db");

const TELEGRAM_ENABLED = ["1", "true", "yes", "y", "on"].includes(
  String(process.env.TELEGRAM_ENABLED || "").toLowerCase()
);
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_SUPPORT_CHAT_ID = process.env.TELEGRAM_SUPPORT_CHAT_ID || "";

const api =
  TELEGRAM_ENABLED && TELEGRAM_BOT_TOKEN
    ? axios.create({
        baseURL: `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`,
        timeout: 30_000,
      })
    : null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) =>
  String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

async function tg(method, payload) {
  if (!api) return null;
  const { data } = await api.post(`/${method}`, payload);
  return data?.result ?? null;
}

async function sendMessage(chatId, text, extra = {}) {
  if (!api) return null;
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

async function answerCallback(callbackQueryId) {
  if (!api) return null;
  return tg("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

async function setState(telegramUserId, state) {
  await db.query(
    `UPDATE telegram_users SET state=?, updated_at=NOW() WHERE telegram_user_id=?`,
    [state, telegramUserId]
  );
}

async function ensureConversation(telegramUserId, { reopenIfClosed = false } = {}) {
  const tid = String(telegramUserId);
  await db.query(
    `INSERT INTO support_conversations (telegram_user_id, status, last_message_at, created_at, updated_at)
     VALUES (?, 'OPEN', NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       updated_at=NOW(),
       status = CASE WHEN status='CLOSED' AND ? THEN 'OPEN' ELSE status END`,
    [tid, reopenIfClosed ? 1 : 0]
  );
  const [[row]] = await db.query(
    `SELECT id, status, claimed_by_user_id, claimed_by_username
       FROM support_conversations
      WHERE telegram_user_id=? LIMIT 1`,
    [tid]
  );
  return row || null;
}

async function addConversationMessage(conversationId, direction, body, agent = null) {
  await db.query(
    `INSERT INTO support_messages (conversation_id, direction, body, agent_user_id, agent_username, created_at)
     VALUES (?,?,?,?,?,NOW())`,
    [
      Number(conversationId),
      String(direction),
      String(body || ""),
      agent?.agentUserId ?? null,
      agent?.agentUsername ?? null,
    ]
  );
  await db.query(
    `UPDATE support_conversations SET last_message_at=NOW(), updated_at=NOW() WHERE id=?`,
    [Number(conversationId)]
  );
}

async function upsertUser(from, chat) {
  const telegramUserId = String(from?.id || "");
  const chatId = String(chat?.id || "");
  const username = from?.username ? String(from.username) : null;
  const firstName = from?.first_name ? String(from.first_name) : null;
  const lastName = from?.last_name ? String(from.last_name) : null;

  await db.query(
    `INSERT INTO telegram_users (telegram_user_id, chat_id, username, first_name, last_name, state, created_at, updated_at)
     VALUES (?,?,?,?,?,'idle',NOW(),NOW())
     ON DUPLICATE KEY UPDATE
       chat_id=VALUES(chat_id),
       username=VALUES(username),
       first_name=VALUES(first_name),
       last_name=VALUES(last_name),
       updated_at=NOW()`,
    [telegramUserId, chatId, username, firstName, lastName]
  );

  const [[row]] = await db.query(
    `SELECT * FROM telegram_users WHERE telegram_user_id=? LIMIT 1`,
    [telegramUserId]
  );
  return row || null;
}

async function getTracking(code) {
  const tracking = String(code || "").trim();
  if (!tracking) return null;

  const [[enc]] = await db.query(
    `SELECT e.id_envio, e.tracking_code, e.fecha, e.total, e.id_estado_actual,
            c.nombre AS cliente_nombre, c.dpi AS cliente_dpi
       FROM envios e
       INNER JOIN clientes c ON c.id_cliente=e.id_cliente
      WHERE e.tracking_code=?`,
    [tracking]
  );
  if (!enc) return { notFound: true };

  const [estados] = await db.query(
    `SELECT id_estado_envio, nombre FROM estados_envio WHERE activo=1 ORDER BY orden`
  );
  const totalEstados = estados.length || 1;
  const idxActual = estados.findIndex(
    (s) => s.id_estado_envio === enc.id_estado_actual
  );
  const progress = Math.max(
    0,
    Math.round(((idxActual + 1) / totalEstados) * 100)
  );

  const [hist] = await db.query(
    `SELECT et.*, es.nombre AS estado
       FROM envios_tracking et
       INNER JOIN estados_envio es ON es.id_estado_envio=et.id_estado_envio
      WHERE et.id_envio=?
      ORDER BY et.fecha_evento ASC`,
    [enc.id_envio]
  );

  const status =
    estados.find((s) => s.id_estado_envio === enc.id_estado_actual)?.nombre ||
    "desconocido";

  return {
    code: enc.tracking_code,
    status,
    progress,
    checkpoints: (hist || []).map((h) => ({
      ts: h.fecha_evento,
      text: `${h.estado}${h.nota ? ` · ${h.nota}` : ""}`,
    })),
  };
}

async function subscribeTracking(telegramUserId, trackingCode) {
  await db.query(
    `INSERT INTO telegram_tracking_subscriptions (telegram_user_id, tracking_code, active, created_at)
     VALUES (?,?,1,NOW())
     ON DUPLICATE KEY UPDATE active=1`,
    [String(telegramUserId), String(trackingCode).trim()]
  );
}

async function listPendingByDpi(dpi) {
  const clean = String(dpi || "").trim();
  if (!clean) return [];
  const [rows] = await db.query(
    `SELECT e.tracking_code, COALESCE(es.nombre,'') AS estado
       FROM envios e
       INNER JOIN clientes c ON c.id_cliente=e.id_cliente
       LEFT JOIN estados_envio es ON es.id_estado_envio=e.id_estado_actual
      WHERE c.dpi=?
        AND (es.nombre IS NULL OR LOWER(es.nombre) NOT LIKE '%entreg%')
      ORDER BY e.id_envio DESC
      LIMIT 10`,
    [clean]
  );
  return rows || [];
}

function mainMenuKeyboard() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "📦 Consultar tracking", callback_data: "track" }],
        [{ text: "🪪 Mis envíos por DPI", callback_data: "by_dpi" }],
        [{ text: "🧑‍💬 Contactar agente", callback_data: "agent" }],
      ],
    },
  };
}

async function sendMainMenu(chatId) {
  return sendMessage(
    chatId,
    "<b>Envios Occidente</b>\n\nElige una opción o escribe tu número de seguimiento.",
    mainMenuKeyboard()
  );
}

async function sendMainMenuToTelegramUser(telegramUserId, extraText = null) {
  if (!api) return false;
  const [[u]] = await db.query(
    `SELECT chat_id FROM telegram_users WHERE telegram_user_id=? LIMIT 1`,
    [String(telegramUserId)]
  );
  if (!u?.chat_id) return false;
  if (extraText) {
    await sendMessage(String(u.chat_id), extraText).catch(() => {});
  }
  await sendMainMenu(String(u.chat_id));
  return true;
}

async function ensureProfileOrAsk(user) {
  if (!user?.nombre) return "await_name";
  if (!user?.telefono) return "await_phone";
  if (!user?.dpi) return "await_dpi";
  return null;
}

async function notifySupportNewChat(telegramUserId) {
  if (!api || !TELEGRAM_SUPPORT_CHAT_ID) return;
  const [[u]] = await db.query(
    `SELECT * FROM telegram_users WHERE telegram_user_id=? LIMIT 1`,
    [String(telegramUserId)]
  );
  if (!u) return;
  const conv = await ensureConversation(telegramUserId);
  if (conv?.id) {
    await addConversationMessage(
      conv.id,
      "SYS",
      "Solicitud de agente (registro completado)"
    ).catch(() => {});
  }
  const msg = await sendMessage(
    String(TELEGRAM_SUPPORT_CHAT_ID),
    `🆕 <b>Nuevo chat</b>\n\n` +
      `ID: <code>${esc(u.telegram_user_id)}</code>\n` +
      `Usuario: @${esc(u.username || "-")}\n` +
      `Nombre: <b>${esc(u.nombre || "-")}</b>\n` +
      `Tel: <b>${esc(u.telefono || "-")}</b>\n` +
      `DPI: <b>${esc(u.dpi || "-")}</b>\n\n` +
      `Responde a este mensaje para contestar al usuario.`
  );
  if (msg?.message_id) {
    await db.query(
      `INSERT INTO telegram_support_map (support_message_id, telegram_user_id, created_at)
       VALUES (?,?,NOW())
       ON DUPLICATE KEY UPDATE telegram_user_id=VALUES(telegram_user_id)`,
      [String(msg.message_id), String(telegramUserId)]
    );
  }
}

async function forwardToSupport(user, text) {
  if (!api || !TELEGRAM_SUPPORT_CHAT_ID) return;
  const msg = await sendMessage(
    String(TELEGRAM_SUPPORT_CHAT_ID),
    `💬 <b>Mensaje de usuario</b> <code>${esc(user.telegram_user_id)}</code>\n` +
      `Nombre: <b>${esc(user.nombre || "-")}</b> · DPI: <b>${esc(
        user.dpi || "-"
      )}</b>\n\n` +
      `${esc(text)}`
  );
  if (msg?.message_id) {
    await db.query(
      `INSERT INTO telegram_support_map (support_message_id, telegram_user_id, created_at)
       VALUES (?,?,NOW())
       ON DUPLICATE KEY UPDATE telegram_user_id=VALUES(telegram_user_id)`,
      [String(msg.message_id), String(user.telegram_user_id)]
    );
  }
}

async function handleSupportMessage(msg) {
  if (!api || !TELEGRAM_SUPPORT_CHAT_ID) return;
  if (!msg?.reply_to_message?.message_id) return;
  const replyToId = String(msg.reply_to_message.message_id);
  const [[map]] = await db.query(
    `SELECT telegram_user_id FROM telegram_support_map WHERE support_message_id=? LIMIT 1`,
    [replyToId]
  );
  if (!map?.telegram_user_id) return;
  const [[u]] = await db.query(
    `SELECT chat_id FROM telegram_users WHERE telegram_user_id=? LIMIT 1`,
    [String(map.telegram_user_id)]
  );
  if (!u?.chat_id) return;
  const text = String(msg.text || "").trim();
  if (!text) return;
  await sendMessage(String(u.chat_id), `🧑‍💼 Agente:\n\n${esc(text)}`);
}

async function handlePrivateMessage(user, msg) {
  const chatId = String(msg.chat.id);
  const text = String(msg.text || "").trim();
  if (!text) return;

  if (text === "/chatid") {
    await sendMessage(
      chatId,
      `chat_id: <code>${esc(chatId)}</code>\ntelegram_user_id: <code>${esc(
        user.telegram_user_id
      )}</code>`
    );
    return;
  }

  if (text === "/start" || text === "/menu") {
    await setState(user.telegram_user_id, "idle");
    await sendMainMenu(chatId);
    return;
  }

  if (text === "/salir") {
    await setState(user.telegram_user_id, "idle");
    await sendMessage(chatId, "Listo. Saliste del chat con agente.");
    await sendMainMenu(chatId);
    return;
  }

  if (user.state === "await_tracking") {
    const t = await getTracking(text);
    if (!t || t.notFound) {
      await sendMessage(chatId, "No encontré ese tracking. Verifica e intenta de nuevo.");
      return;
    }
    await subscribeTracking(user.telegram_user_id, t.code);
    const hist = t.checkpoints
      .slice(-8)
      .map((c) => `• ${esc(c.text)}`)
      .join("\n");
    await setState(user.telegram_user_id, "idle");
    await sendMessage(
      chatId,
      `📦 <b>${esc(t.code)}</b>\nEstado: <b>${esc(t.status)}</b>\nProgreso: <b>${t.progress}%</b>\n\n${hist || "Sin eventos aún."}`
    );
    await sendMainMenu(chatId);
    return;
  }

  if (user.state === "await_dpi_list") {
    await db.query(
      `UPDATE telegram_users SET dpi=?, updated_at=NOW() WHERE telegram_user_id=?`,
      [text, String(user.telegram_user_id)]
    );
    await setState(user.telegram_user_id, "idle");
    const pending = await listPendingByDpi(text);
    if (!pending.length) {
      await sendMessage(chatId, "No encontré envíos pendientes para ese DPI.");
      await sendMainMenu(chatId);
      return;
    }
    const kb = {
      reply_markup: {
        inline_keyboard: pending.map((r) => [
          {
            text: `📦 ${r.tracking_code} · ${r.estado || "sin estado"}`,
            callback_data: `track:${r.tracking_code}`,
          },
        ]),
      },
    };
    await sendMessage(chatId, "Estos son tus envíos pendientes:", kb);
    return;
  }

  if (user.state === "await_name") {
    await db.query(
      `UPDATE telegram_users SET nombre=?, updated_at=NOW() WHERE telegram_user_id=?`,
      [text, String(user.telegram_user_id)]
    );
    await setState(user.telegram_user_id, "await_phone");
    await sendMessage(chatId, "Gracias. Ahora ingresa tu número de teléfono:");
    return;
  }

  if (user.state === "await_phone") {
    await db.query(
      `UPDATE telegram_users SET telefono=?, updated_at=NOW() WHERE telegram_user_id=?`,
      [text, String(user.telegram_user_id)]
    );
    await setState(user.telegram_user_id, "await_dpi");
    await sendMessage(chatId, "Perfecto. Ahora ingresa tu DPI:");
    return;
  }

  if (user.state === "await_dpi") {
    await db.query(
      `UPDATE telegram_users SET dpi=?, updated_at=NOW() WHERE telegram_user_id=?`,
      [text, String(user.telegram_user_id)]
    );
    // Auto-suscripción: al registrarse para agente, suscribir envíos pendientes por DPI
    const pending = await listPendingByDpi(text).catch(() => []);
    for (const p of pending || []) {
      if (p?.tracking_code) {
        await subscribeTracking(user.telegram_user_id, p.tracking_code).catch(() => {});
      }
    }

    await setState(user.telegram_user_id, "agent_chat");
    await sendMessage(
      chatId,
      "Listo. Ya puedes escribir tu mensaje para un agente. (Escribe /salir para terminar)"
    );
    await notifySupportNewChat(user.telegram_user_id);
    return;
  }

  if (user.state === "agent_chat") {
    const conv = await ensureConversation(user.telegram_user_id);
    if (!conv?.id || String(conv.status).toUpperCase() === "CLOSED") {
      await setState(user.telegram_user_id, "idle");
      await sendMainMenuToTelegramUser(
        user.telegram_user_id,
        "Esta conversación fue cerrada. Elige una opción del menú para continuar."
      );
      return;
    }
    await addConversationMessage(conv.id, "IN", text).catch(() => {});
    return;
  }

  // Fallback: si el usuario escribe un tracking directo
  if (/^[a-z0-9-]{5,}$/i.test(text)) {
    const t = await getTracking(text);
    if (t && !t.notFound) {
      await subscribeTracking(user.telegram_user_id, t.code);
      const hist = t.checkpoints
        .slice(-8)
        .map((c) => `• ${esc(c.text)}`)
        .join("\n");
      await sendMessage(
        chatId,
        `📦 <b>${esc(t.code)}</b>\nEstado: <b>${esc(t.status)}</b>\nProgreso: <b>${t.progress}%</b>\n\n${hist || "Sin eventos aún."}`
      );
      await sendMainMenu(chatId);
      return;
    }
  }

  await sendMainMenu(chatId);
}

async function handleCallback(user, cq) {
  const chatId = String(cq.message.chat.id);
  const data = String(cq.data || "");
  await answerCallback(String(cq.id));

  if (data === "track") {
    await setState(user.telegram_user_id, "await_tracking");
    await sendMessage(chatId, "Ingresa tu número de seguimiento:");
    return;
  }

  if (data.startsWith("track:")) {
    const code = data.slice("track:".length).trim();
    const t = await getTracking(code);
    if (!t || t.notFound) {
      await sendMessage(chatId, "No encontré ese tracking.");
      return;
    }
    await subscribeTracking(user.telegram_user_id, t.code);
    const hist = t.checkpoints
      .slice(-8)
      .map((c) => `• ${esc(c.text)}`)
      .join("\n");
    await sendMessage(
      chatId,
      `📦 <b>${esc(t.code)}</b>\nEstado: <b>${esc(t.status)}</b>\nProgreso: <b>${t.progress}%</b>\n\n${hist || "Sin eventos aún."}`
    );
    await sendMainMenu(chatId);
    return;
  }

  if (data === "by_dpi") {
    if (user.dpi) {
      const pending = await listPendingByDpi(user.dpi);
      if (!pending.length) {
        await sendMessage(chatId, "No encontré envíos pendientes para tu DPI.");
        await sendMainMenu(chatId);
        return;
      }
      // Suscribe automáticamente los pendientes (máx 10)
      for (const p of pending || []) {
        if (p?.tracking_code) {
          await subscribeTracking(user.telegram_user_id, p.tracking_code).catch(() => {});
        }
      }
      const kb = {
        reply_markup: {
          inline_keyboard: pending.map((r) => [
            {
              text: `📦 ${r.tracking_code} · ${r.estado || "sin estado"}`,
              callback_data: `track:${r.tracking_code}`,
            },
          ]),
        },
      };
      await sendMessage(chatId, "Estos son tus envíos pendientes:", kb);
      return;
    }
    await setState(user.telegram_user_id, "await_dpi_list");
    await sendMessage(chatId, "Ingresa tu DPI para listar envíos pendientes:");
    return;
  }

  if (data === "agent") {
    const needed = await ensureProfileOrAsk(user);
    if (needed === "await_name") {
      await setState(user.telegram_user_id, "await_name");
      await sendMessage(chatId, "Para contactarte con un agente, ingresa tu nombre completo:");
      return;
    }
    if (needed === "await_phone") {
      await setState(user.telegram_user_id, "await_phone");
      await sendMessage(chatId, "Ingresa tu número de teléfono:");
      return;
    }
    if (needed === "await_dpi") {
      await setState(user.telegram_user_id, "await_dpi");
      await sendMessage(chatId, "Ingresa tu DPI:");
      return;
    }

    await setState(user.telegram_user_id, "agent_chat");
    await sendMessage(
      chatId,
      "Listo. Ya puedes escribir tu mensaje para un agente. (Escribe /salir para terminar)"
    );
    await ensureConversation(user.telegram_user_id, { reopenIfClosed: true }).catch(() => {});
    await notifySupportNewChat(user.telegram_user_id);
    return;
  }

  await sendMainMenu(chatId);
}

let polling = false;
let updateOffset = 0;

async function pollLoop() {
  polling = true;
  while (polling) {
    try {
      const result = await tg("getUpdates", {
        offset: updateOffset,
        timeout: 25,
        allowed_updates: ["message", "callback_query"],
      });
      const updates = Array.isArray(result) ? result : [];
      for (const u of updates) {
        updateOffset = Math.max(updateOffset, Number(u.update_id) + 1);

        if (u.callback_query) {
          const cq = u.callback_query;
          const user = await upsertUser(cq.from, cq.message.chat);
          if (user) await handleCallback(user, cq);
          continue;
        }

        if (u.message) {
          const msg = u.message;
          if (
            TELEGRAM_SUPPORT_CHAT_ID &&
            String(msg.chat.id) === String(TELEGRAM_SUPPORT_CHAT_ID)
          ) {
            if (String(msg.text || "").trim() === "/chatid") {
              await sendMessage(
                String(TELEGRAM_SUPPORT_CHAT_ID),
                `support_chat_id: <code>${esc(msg.chat.id)}</code>`
              );
              continue;
            }
            await handleSupportMessage(msg);
            continue;
          }
          if (msg.chat.type !== "private") continue;
          const user = await upsertUser(msg.from, msg.chat);
          if (user) await handlePrivateMessage(user, msg);
        }
      }
    } catch (e) {
      console.error("telegram poll:", e.message);
      await sleep(2000);
    }
  }
}

async function startTelegramBot() {
  if (!api) return false;
  if (polling) return true;
  pollLoop(); // no await
  console.log("🤖 Telegram bot: polling iniciado");
  return true;
}

async function notifyTrackingUpdate({ tracking, estado, nota }) {
  if (!api) return false;
  const code = String(tracking || "").trim();
  const status = String(estado || "").trim();
  if (!code || !status) return false;

  const [subs] = await db.query(
    `SELECT tu.chat_id
       FROM telegram_tracking_subscriptions ts
       INNER JOIN telegram_users tu ON tu.telegram_user_id=ts.telegram_user_id
      WHERE ts.tracking_code=? AND ts.active=1`,
    [code]
  );

  for (const s of subs || []) {
    await sendMessage(
      String(s.chat_id),
      `🔔 Actualización de envío\n\n📦 <b>${esc(code)}</b>\nEstado: <b>${esc(
        status
      )}</b>${nota ? `\nNota: ${esc(nota)}` : ""}`
    ).catch(() => {});
  }

  if (status.toLowerCase().includes("entreg")) {
    await db.query(
      `UPDATE telegram_tracking_subscriptions SET active=0 WHERE tracking_code=?`,
      [code]
    );
  }
  return true;
}

module.exports = {
  startTelegramBot,
  notifyTrackingUpdate,
  sendMainMenuToTelegramUser,
  async sendAgentReplyToUser({ telegramUserId, agentUsername, text }) {
    if (!api) return false;
    const tid = String(telegramUserId);
    const [[u]] = await db.query(
      `SELECT chat_id FROM telegram_users WHERE telegram_user_id=? LIMIT 1`,
      [tid]
    );
    if (!u?.chat_id) return false;
    const prefix = agentUsername ? `${String(agentUsername)}: ` : "";
    await sendMessage(String(u.chat_id), `🧑‍💼 ${esc(prefix)}${esc(text)}`);
    return true;
  },
};
