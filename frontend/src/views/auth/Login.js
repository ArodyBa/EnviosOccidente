import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoadingBtn(true);
    try {
      await login(usuario, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err?.response?.data?.message || "Credenciales inválidas.");
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleSalir = () => navigate("/");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            borderRadius: 4,
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
          }}
        >
          <Stack spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg, var(--eo-primary), var(--eo-primary2))",
                border: "1px solid var(--eo-border)",
              }}
            />
            <Typography variant="h5" align="center" sx={{ fontWeight: 900 }}>
              Inicio de Sesión
            </Typography>
            <Typography color="text.secondary" align="center">
              Accede al panel para gestionar envíos, clientes y catálogos.
            </Typography>
          </Stack>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              fullWidth
              required
              autoFocus
            />

            <TextField
              label="Contraseña"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd((s) => !s)}
                      edge="end"
                    >
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!usuario || !password || loadingBtn}
              sx={{ py: 1.2 }}
            >
              {loadingBtn ? "Ingresando..." : "Entrar"}
            </Button>
            <Button variant="outlined" color="inherit" onClick={handleSalir}>
              Salir
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

