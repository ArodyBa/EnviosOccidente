import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useAuth } from "../../context/AuthContext";
import {
  claimConversation,
  closeConversation,
  getConversationMessages,
  listConversations,
  sendConversationMessage,
} from "../../services/supportService";

const statusChip = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "CLAIMED") return { label: "Asignado", color: "info" };
  if (s === "CLOSED") return { label: "Cerrado", color: "default" };
  return { label: "Abierto", color: "success" };
};

export default function Chat() {
  const { user } = useAuth();
  const [status, setStatus] = useState("open");
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const loadConversations = async () => {
    setError("");
    try {
      const rows = await listConversations(status);
      setConversations(Array.isArray(rows) ? rows : []);
      if (selectedId && !(rows || []).some((r) => r.id === selectedId)) {
        setSelectedId(null);
        setMessages([]);
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Error cargando conversaciones");
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    setError("");
    try {
      const rows = await getConversationMessages(conversationId);
      setMessages(Array.isArray(rows) ? rows : []);
      requestAnimationFrame(() =>
        bottomRef.current?.scrollIntoView({ behavior: "instant" })
      );
    } catch (e) {
      setError(e?.response?.data?.message || "Error cargando mensajes");
    }
  };

  useEffect(() => {
    loadConversations();
    const t = setInterval(loadConversations, 3000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    loadMessages(selectedId);
    if (!selectedId) return undefined;
    const t = setInterval(() => loadMessages(selectedId), 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const handleSelect = async (id) => {
    setSelectedId(id);
    await loadMessages(id);
  };

  const handleClaim = async () => {
    if (!selectedId) return;
    setError("");
    try {
      await claimConversation(selectedId);
      await loadConversations();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo aceptar.");
    }
  };

  const handleClose = async () => {
    if (!selectedId) return;
    setError("");
    try {
      await closeConversation(selectedId);
      await loadConversations();
      await loadMessages(selectedId);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo cerrar.");
    }
  };

  const handleSend = async () => {
    if (!selectedId) return;
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    setError("");
    try {
      await sendConversationMessage(selectedId, text);
      await loadMessages(selectedId);
      await loadConversations();
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo enviar.");
    }
  };

  const canSend = useMemo(() => {
    if (!selected) return false;
    if (String(selected.status).toUpperCase() === "CLOSED") return false;
    if (!selected.claimed_by_user_id || !user?.id) return false;
    return Number(selected.claimed_by_user_id) === Number(user.id);
  }, [selected, user?.id]);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4">Chat</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Atiende solicitudes de clientes (Telegram).
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Abiertos"
            variant={status === "open" ? "filled" : "outlined"}
            onClick={() => setStatus("open")}
            color="success"
          />
          <Chip
            label="Asignados"
            variant={status === "claimed" ? "filled" : "outlined"}
            onClick={() => setStatus("claimed")}
            color="info"
          />
          <Chip
            label="Todos"
            variant={status === "all" ? "filled" : "outlined"}
            onClick={() => setStatus("all")}
          />
          <IconButton onClick={loadConversations} aria-label="refrescar">
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid var(--eo-border)" }}>
            <Typography fontWeight={900}>Conversaciones</Typography>
            <Typography variant="body2" color="text.secondary">
              {conversations.length} en cola
            </Typography>
          </Box>
          <List dense sx={{ maxHeight: { xs: "auto", md: "70vh" }, overflow: "auto" }}>
            {conversations.map((c) => {
              const chip = statusChip(c.status);
              const primary =
                c.nombre || c.username
                  ? `${c.nombre || ""}${c.username ? ` (@${c.username})` : ""}`
                  : `Usuario ${c.telegram_user_id}`;
              const secondary = [
                c.dpi ? `DPI: ${c.dpi}` : null,
                c.telefono ? `Tel: ${c.telefono}` : null,
                c.claimed_by_username ? `Agente: ${c.claimed_by_username}` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <ListItemButton
                  key={c.id}
                  selected={c.id === selectedId}
                  onClick={() => handleSelect(c.id)}
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Badge
                          color={chip.color}
                          variant="dot"
                          overlap="circular"
                        >
                          <Box />
                        </Badge>
                        <Typography fontWeight={800} noWrap>
                          {primary}
                        </Typography>
                        <Chip
                          size="small"
                          label={chip.label}
                          color={chip.color}
                          variant="outlined"
                        />
                      </Stack>
                    }
                    secondary={secondary}
                    secondaryTypographyProps={{
                      sx: { color: "text.secondary" },
                      noWrap: true,
                    }}
                  />
                </ListItemButton>
              );
            })}
            {!conversations.length ? (
              <Box sx={{ p: 2 }}>
                <Typography color="text.secondary">
                  No hay conversaciones por ahora.
                </Typography>
              </Box>
            ) : null}
          </List>
        </Paper>

        <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid var(--eo-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography fontWeight={900}>
                {selected ? "Conversación" : "Selecciona una conversación"}
              </Typography>
              {selected ? (
                <Typography variant="body2" color="text.secondary">
                  {selected.claimed_by_username
                    ? `Asignado a: ${selected.claimed_by_username}`
                    : "Sin asignar"}
                </Typography>
              ) : null}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<LockPersonRoundedIcon />}
                onClick={handleClaim}
                disabled={!selectedId}
              >
                Aprobar
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<CheckCircleRoundedIcon />}
                onClick={handleClose}
                disabled={!selectedId}
              >
                Cerrar
              </Button>
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2,
              minHeight: { xs: 260, md: "60vh" },
              maxHeight: { xs: "60vh", md: "60vh" },
              overflow: "auto",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0))",
            }}
          >
            {selectedId ? (
              <Stack spacing={1.25}>
                {messages.map((m) => {
                  const dir = String(m.direction || "").toUpperCase();
                  const mine = dir === "OUT";
                  const sys = dir === "SYS";
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        display: "flex",
                        justifyContent: sys ? "center" : mine ? "flex-end" : "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: "88%",
                          px: 1.5,
                          py: 1,
                          borderRadius: 3,
                          border: "1px solid var(--eo-border)",
                          backgroundColor: sys
                            ? "rgba(255,255,255,0.03)"
                            : mine
                            ? "rgba(99, 102, 241, 0.18)"
                            : "rgba(255,255,255,0.03)",
                        }}
                      >
                        {sys ? null : (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 800 }}
                          >
                            {mine ? `${m.agent_username || "Agente"}:` : "Cliente:"}
                          </Typography>
                        )}
                        <Typography sx={{ whiteSpace: "pre-wrap" }}>
                          {m.body}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
                <div ref={bottomRef} />
              </Stack>
            ) : (
              <Typography color="text.secondary">
                Selecciona una conversación para ver mensajes.
              </Typography>
            )}
          </Box>

          <Divider />
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="flex-end">
              <TextField
                multiline
                minRows={1}
                maxRows={4}
                fullWidth
                placeholder={
                  canSend
                    ? "Escribe un mensaje…"
                    : "Primero aprueba la conversación (o ya está asignada)."
                }
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedId || !canSend}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!selectedId || !canSend || !draft.trim()}
                color="primary"
              >
                <SendRoundedIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setSelectedId(null);
                  setMessages([]);
                }}
                disabled={!selectedId}
                color="inherit"
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
