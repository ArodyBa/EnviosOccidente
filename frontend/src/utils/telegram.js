export function getTelegramBotLink() {
  const explicit = process.env.REACT_APP_TELEGRAM_BOT_LINK;
  if (explicit) return explicit;

  const username = process.env.REACT_APP_TELEGRAM_BOT_USERNAME;
  if (!username) return null;

  const startParam = process.env.REACT_APP_TELEGRAM_START_PARAM || "web";
  const suffix = startParam ? `?start=${encodeURIComponent(startParam)}` : "";
  return `https://t.me/${username}${suffix}`;
}

