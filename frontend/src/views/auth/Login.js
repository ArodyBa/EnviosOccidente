import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
} from '@mui/material';

const Login = () => {
  const [pin, setPin] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    console.log('PIN ingresado:', pin); // Depurar el PIN ingresado
    if (login(pin)) {
      console.log('Login exitoso');
      navigate('/dashboard'); // Redirige al menú principal si el PIN es correcto
    } else {
      alert('PIN incorrecto. Inténtalo nuevamente.');
    }
  };

  const handleSalir = () => {
    navigate('/'); // Redirige al menú principal (landing page)
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: '100px' }}>
      <Paper elevation={3} sx={{ padding: '20px' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Inicio de Sesión
        </Typography>
        <Box
          component="form"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <TextField
            label="Ingresa tu PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            fullWidth
            required
          />
          <Button variant="contained" color="primary" type="submit">
            Entrar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSalir}
          >
            Salir
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
