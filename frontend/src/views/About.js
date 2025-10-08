import React from 'react';
import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import NavigationBar from '../components/NavigationBar';

const About = () => {
  return (
    <>
      <NavigationBar />
      <Container sx={{ py: { xs: 6, md: 8 } }}>
        <Typography variant="h3" fontWeight={800} gutterBottom>
          Acerca de Envíos Occidente
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Logística moderna para que tus paquetes lleguen rápido, seguros y con total transparencia.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Nuestra Misión</Typography>
              <Typography sx={{ mt: 1 }}>
                Conectar personas y negocios con una red de envíos eficiente, confiable y con seguimiento en tiempo real.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Cobertura</Typography>
              <Typography sx={{ mt: 1 }}>
                Presencia nacional con rutas optimizadas y aliados estratégicos para ampliar capacidad.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700}>Atención</Typography>
              <Typography sx={{ mt: 1 }}>
                Soporte 24/7 y notificaciones proactivas sobre el estado de tus envíos.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default About;

