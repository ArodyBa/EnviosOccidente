import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import TelegramIcon from "@mui/icons-material/Telegram";

export default function FloatingTelegramButton() {
  const link =
    process.env.REACT_APP_TELEGRAM_BOT_LINK ||
    (process.env.REACT_APP_TELEGRAM_BOT_USERNAME
      ? `https://t.me/${process.env.REACT_APP_TELEGRAM_BOT_USERNAME}`
      : null);

  if (!link) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        right: 18,
        bottom: { xs: 86, sm: 22 },
        zIndex: (theme) => theme.zIndex.modal + 2,
      }}
    >
      <Tooltip title="Abrir Telegram" placement="left">
        <IconButton
          component="a"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "1px solid var(--eo-border)",
            color: "#E5E7EB",
            background:
              "linear-gradient(135deg, var(--eo-primary), var(--eo-primary2))",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            "&:hover": { filter: "brightness(1.05)" },
          }}
        >
          <TelegramIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

