import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";

function NavigationBar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#0f172a" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Nombre del sistema */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Envíos Occidente
        </Typography>

        {/* Navegación */}
        <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 }, alignItems: "center" }}>
          <Button component={Link} to="/" color="inherit" sx={{ textTransform: "none" }}>
            Inicio
          </Button>

          {/* separador */}
          <Box sx={{ height: 30, width: 2, backgroundColor: "white" }} />

          <Button component="a" href="#rastreo" color="inherit" sx={{ textTransform: "none" }}>
            Rastrear envío
          </Button>

          {/* separador */}
          <Box sx={{ height: 30, width: 2, backgroundColor: "white" }} />

          <Button component={Link} to="/precios" color="inherit" sx={{ textTransform: "none" }}>
            Precios
          </Button>

          {/* separador */}
          <Box sx={{ height: 30, width: 2, backgroundColor: "white" }} />

          <Button component={Link} to="/about" color="inherit" sx={{ textTransform: "none" }}>
            Acerca de Nosotros
          </Button>

          {/* separador */}
          <Box sx={{ height: 30, width: 2, backgroundColor: "white" }} />

          <Button component={Link} to="/login" color="inherit" sx={{ textTransform: "none" }}>
            <LoginIcon />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar;
