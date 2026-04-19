import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";
import LoginIcon from "@mui/icons-material/Login";

function NavigationBar() {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha("#0F172A", 0.86),
        borderBottom: "1px solid var(--eo-border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 900 }}>
          Envios Occidente
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1.5 },
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Button component={Link} to="/" color="inherit" sx={{ borderRadius: 2 }}>
            Inicio
          </Button>

          <Button
            component="a"
            href="#rastreo"
            color="inherit"
            sx={{ borderRadius: 2 }}
          >
            Rastrear envío
          </Button>

          <Button
            component={Link}
            to="/precios"
            color="inherit"
            sx={{ borderRadius: 2, display: { xs: "none", sm: "inline-flex" } }}
          >
            Precios
          </Button>

          <Button
            component={Link}
            to="/about"
            color="inherit"
            sx={{ borderRadius: 2, display: { xs: "none", sm: "inline-flex" } }}
          >
            Acerca de Nosotros
          </Button>

          <Button
            component={Link}
            to="/login"
            color="inherit"
            sx={{ borderRadius: 2, minWidth: 44 }}
          >
            <LoginIcon />
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar;

