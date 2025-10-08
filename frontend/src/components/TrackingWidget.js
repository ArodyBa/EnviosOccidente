import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import proyecto from "../services/api/Proyecto";

// Respuesta simulada si el backend aún no tiene endpoint de tracking
const mockTracking = (code) => ({
  code,
  status: "En tránsito",
  progress: 60,
  checkpoints: [
    { ts: "2025-01-15 08:20", text: "Paquete recibido en sucursal origen" },
    { ts: "2025-01-15 12:40", text: "Despachado del centro de distribución" },
    { ts: "2025-01-16 09:10", text: "En ruta hacia destino" },
  ],
});

const TrackingWidget = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const onTrack = async () => {
    setError(null);
    setData(null);
    const code = value.trim();
    if (!code) {
      setError("Ingresa un código de tracking.");
      return;
    }
    setLoading(true);
    try {
      // Intenta llamar a un endpoint estándar: /tracking/:code
      // Ajusta según tu backend cuando esté disponible
      const res = await proyecto.get(`/tracking/${encodeURIComponent(code)}`);
      setData(res.data);
    } catch (e) {
      // Fallback elegante a datos simulados
      setData(mockTracking(code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2.5, borderRadius: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Rastrea tu envío
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <TextField
          label="Código de tracking"
          placeholder="Ej. OCC-123456"
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
        />
        <Button variant="contained" onClick={onTrack} disabled={loading}>
          {loading ? "Buscando..." : "Rastrear"}
        </Button>
      </Box>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {data && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Estado: {data.status}
          </Typography>
          {typeof data.progress === "number" && (
            <LinearProgress
              variant="determinate"
              value={data.progress}
              sx={{ mt: 1, borderRadius: 1 }}
            />
          )}
          {Array.isArray(data.checkpoints) && (
            <List dense sx={{ mt: 1 }}>
              {data.checkpoints.map((c, i) => (
                <ListItem key={i} disableGutters>
                  <ListItemText
                    primary={c.text}
                    secondary={c.ts}
                    primaryTypographyProps={{ fontSize: 14 }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default TrackingWidget;

