import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box, Button, TextField, Typography, Container, Paper,
  IconButton, InputAdornment, Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
      await login(usuario, password); // llama API de backend
      navigate("/dashboard", { replace: true }); // 👈 siempre redirige a la página principal
    } catch (err) {
      alert(err?.response?.data?.message || "Credenciales inválidas.");
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleSalir = () => navigate("/"); // también regresa al inicio

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, width: "100%" }}>
        <Stack spacing={2} alignItems="center">
          <Typography variant="h5" align="center" sx={{ fontWeight: 700 }}>
            Inicio de Sesión
          </Typography>
        </Stack>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
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
                  <IconButton onClick={() => setShowPwd((s) => !s)} edge="end">
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button variant="contained" color="primary" type="submit" disabled={!usuario || !password || loadingBtn}>
            {loadingBtn ? "Ingresando..." : "Entrar"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleSalir}>
            Salir
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
