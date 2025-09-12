import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";

const NavigationBar = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#333" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between", // Espaciado entre secciones
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Armerías Agop
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 }, // Espaciado dinámico entre botones
            alignItems: "center",
          }}
        >
          {/* Botón Inicio */}
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Inicio
          </Button>

          {/* Línea separadora */}
          <Box
            sx={{
              height: "30px",
              width: "2px",
              backgroundColor: "white",
            }}
          />

          {/* Botón Productos */}
          <Button
            component={Link}
            to="/productos"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Productos
          </Button>

          {/* Otra línea separadora */}
          <Box
            sx={{
              height: "30px",
              width: "2px",
              backgroundColor: "white",
            }}
          />

          {/* Icono Iniciar Sesión */}
          <Button
            component={Link}
            to="/login"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            <LoginIcon />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
