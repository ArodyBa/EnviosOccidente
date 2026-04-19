const Twilio = require('twilio');

const enabled = /^true$/i.test(process.env.WHATSAPP_ENABLED || '');
const hasCreds = process.env.WHATSAPP_ACCOUNT_SID && process.env.WHATSAPP_AUTH_TOKEN;
const client = enabled && hasCreds ? new Twilio(process.env.WHATSAPP_ACCOUNT_SID, process.env.WHATSAPP_AUTH_TOKEN) : null;

const normalizeNumber = (value = '') => {
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('whatsapp:')) return trimmed;
  const digits = trimmed.replace(/[^\d+]/g, '');
  if (!digits) return null;
  const formatted = digits.startsWith('+') ? digits : `+${digits.replace(/^0+/, '')}`;
  return `whatsapp:${formatted}`;
};

async function sendStatusChange({ to, tracking, estado, clienteNombre }) {
  if (!client || !enabled) return null;
  const phone = normalizeNumber(to);
  if (!phone || !tracking || !estado || !process.env.WHATSAPP_FROM) return null;
  const saludo = clienteNombre ? `Estimado(a) ${clienteNombre}, ` : '';
  const body = `${saludo}Le saludamos de Envios del Sur de Occidente. El estado de su paquete con guia No. ${tracking} se encuentra actualmente en el siguiente proceso: ${estado}.`;
  return client.messages.create({
    body,
    from: process.env.WHATSAPP_FROM,
    to: phone,
  });
}

module.exports = { sendStatusChange };
