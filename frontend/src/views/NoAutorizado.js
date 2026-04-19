import React from "react";
import { Box, Paper, Typography } from "@mui/material";

export default function NoAutorizado() {
  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Paper sx={{ p: 3, maxWidth: 520, width: "100%" }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          No autorizado
        </Typography>
        <Typography color="text.secondary">
          No tienes permisos para ver esta pantalla.
        </Typography>
      </Paper>
    </Box>
  );
}

