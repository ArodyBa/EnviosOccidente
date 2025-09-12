import React from 'react';
import Menu from '../components/Menu'; // Importa el menú
import { Box, Typography } from '@mui/material';

const Welcome = () => {
  const user = { nombreCompleto: 'Usuario Demo' }; // Simula el usuario actual

  return (
    <Box sx={{ display: 'flex' }}>
      <Menu /> {/* Menú lateral */}
      <Box sx={{ flex: 1, padding: '20px' }}>
        <Typography variant="h1" fontWeight="bold" color="primary" textAlign="center">
          SISTEMA DE INFORMACION
        </Typography>
        <Typography variant="h2" fontWeight="bold" color="primary" textAlign="center">
          Bienvenido {user.nombreCompleto || 'Invitado'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Welcome;
