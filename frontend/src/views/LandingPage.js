import React from "react";
import { Button, Container, Grid, Typography } from "@mui/material";
import NavigationBar from "../components/NavigationBar";

const LandingPage = () => {
  return (
    <>
      {/* Barra de navegación */}
      <NavigationBar />

      {/* Contenido Principal */}
      <Container sx={{ marginTop: "30px" }}>
        <Grid container spacing={4}>
          {/* Sección Promocional */}
          <Grid item xs={12} md={6}>
            <Typography variant="h3" gutterBottom>
              ¡Bienvenido a Armerías 38Super Escobar!
            </Typography>
            <Typography variant="h6" gutterBottom>
              Descubre nuestras ofertas exclusivas en armas, municiones y accesorios.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component="a"
              href="/productos"
            >
              Explora nuestro catálogo
            </Button>
          </Grid>
          {/* Imagen destacada */}
          <Grid item xs={12} md={6}>
            <img
              // src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.freepik.es%2Ffotos-vectores-gratis%2Fpistola-png&psig=AOvVaw0PJbWwXPferhDfUllyB35-&ust=1737944758833000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCLjC-fGqkosDFQAAAAAdAAAAABAE" // Reemplaza con una imagen local o remota
             // alt="Imagen destacada"
             //  style={{ width: "100%", borderRadius: "10px" }}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default LandingPage;
