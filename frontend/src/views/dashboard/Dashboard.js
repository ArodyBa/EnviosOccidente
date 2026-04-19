import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { obtenerOverview } from "../../services/modules/Dashboard";

const StatCard = ({ icon, label, value, actionLabel, onAction }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            border: "1px solid var(--eo-border)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.3 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon fontSize="small" />}
        sx={{ mt: 2 }}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    envios_entregados: null,
    incidencias_pendientes: null,
    tickets_abiertos: null,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await obtenerOverview();
        if (!alive) return;
        setStats({
          envios_entregados: Number(data?.envios_entregados ?? 0),
          incidencias_pendientes: Number(data?.incidencias_pendientes ?? 0),
          tickets_abiertos: Number(data?.tickets_abiertos ?? 0),
        });
      } catch (e) {
        if (!alive) return;
        setStats({
          envios_entregados: 0,
          incidencias_pendientes: 0,
          tickets_abiertos: 0,
        });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const fmt = (n) => (n === null || n === undefined ? "—" : String(n));

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4">Overview</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Resumen rápido del sistema.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate("/envios")}>
          Nuevo envío
        </Button>
      </Stack>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<CheckCircleOutlineIcon sx={{ color: "success.main" }} />}
            label="Envíos entregados"
            value={fmt(stats.envios_entregados)}
            actionLabel="Ver entregados"
            onAction={() => navigate("/seguimiento")}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<ErrorOutlineIcon sx={{ color: "warning.main" }} />}
            label="Incidencias pendientes"
            value={fmt(stats.incidencias_pendientes)}
            actionLabel="Ver incidencias"
            onAction={() => navigate("/seguimiento")}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={
              <ConfirmationNumberOutlinedIcon sx={{ color: "secondary.main" }} />
            }
            label="Tickets abiertos"
            value={fmt(stats.tickets_abiertos)}
            actionLabel="Ver tickets"
            onAction={() => navigate("/chat")}
          />
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.25 } }}>
              <Typography variant="overline" color="text.secondary">
                NUEVA ACTUALIZACIÓN
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5 }}>
                Diseño moderno y responsivo
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Navegación con sidebar, tema oscuro, componentes más consistentes
                y tablas estilizadas para una mejor experiencia.
              </Typography>
              <Button variant="contained" sx={{ mt: 2 }}>
                Abrir configuración
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.25 } }}>
              <Typography variant="h6">Tip</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                En móvil, usa el ícono de menú para abrir el panel lateral.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
