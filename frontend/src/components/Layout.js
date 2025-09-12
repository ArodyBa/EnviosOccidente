import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Menu from './Menu'; // Menú lateral

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Normaliza estilos globales */}
      <CssBaseline />

      {/* Menú lateral */}
      <Menu />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
        }}
      >
        <Toolbar /> {/* Espaciado para el AppBar (si usas uno) */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
