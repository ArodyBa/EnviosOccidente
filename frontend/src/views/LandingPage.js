import React, { useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import ShieldIcon from "@mui/icons-material/Shield";
import NavigationBar from "../components/NavigationBar";
import TrackingWidget from "../components/TrackingWidget";
import SliderHero from "../components/SliderHero";

const floatUp = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const moveTruck = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(24px); }
  100% { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.5; transform: scale(1); }
`;

const LandingPage = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <>
      <NavigationBar />

      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #0f172a 0%, #111827 45%, #1f2937 100%)",
          color: "#fff",
        }}
      >
        <Container sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="Rastreo en tiempo real"
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#e5e7eb",
                  mb: 2,
                  borderRadius: 2,
                }}
              />
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1.1 }}>
                Envíos confiables, rápidos y elegantes
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, color: "#cbd5e1" }}>
                Gestiona tus paquetes con seguimiento de tracking moderno, notificaciones
                y una experiencia ágil de punta a punta.
              </Typography>

              <Box id="rastreo" sx={{ mt: 4 }}>
                <TrackingWidget />
              </Box>

              <Box sx={{ display: "flex", gap: 3, mt: 4, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <RocketLaunchIcon />
                  <Typography>Entregas express</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <ShieldIcon />
                  <Typography>Seguro y confiable</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={8}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  bgcolor: "#0b1220",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {/* AnimaciÃ³n visual del camiÃ³n y paquetes */}
                <Box
                  sx={{
                    height: 240,
                    position: "relative",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  {/* â€œRutaâ€ */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 56,
                      height: 4,
                      bgcolor: "rgba(255,255,255,0.15)",
                      borderRadius: 2,
                    }}
                  />

                  {/* CamiÃ³n */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: 20,
                      right: 20,
                      bottom: 32,
                      display: "flex",
                      justifyContent: "flex-start",
                      animation: `${moveTruck} 3.6s ease-in-out infinite`,
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        px: 2,
                        py: 1.2,
                        borderRadius: 2,
                        bgcolor: "#111827",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <LocalShippingIcon sx={{ fontSize: 28, color: "#60a5fa" }} />
                      <Typography sx={{ color: "#e5e7eb" }}>En Tránsito</Typography>
                    </Box>
                  </Box>

                  {/* Paquetes flotando */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 28,
                      right: 32,
                      animation: `${floatUp} 5s ease-in-out infinite`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        bgcolor: "#1f2937",
                        borderRadius: 1.5,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: 74,
                      right: 92,
                      animation: `${floatUp} 4.2s 0.3s ease-in-out infinite`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#1f2937",
                        borderRadius: 1.25,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    />
                  </Box>

                  {/* Puntos de progreso */}
                  <Box sx={{ position: "absolute", left: 24, bottom: 50, display: "flex", gap: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: i < 2 ? "#60a5fa" : "rgba(255,255,255,0.2)",
                          animation: i < 2 ? `${pulse} 2.2s ${i * 0.2}s infinite` : "none",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
<SliderHero height={440} fit="contain" position="center" />
      {/* Features */}
      <Container sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={4}>
          {[{
            icon: <RocketLaunchIcon sx={{ color: "#0ea5e9" }} />,
            title: "Velocidad",
            desc: "RecolecciÃ³n y entrega optimizadas para tus tiempos.",
          },{
            icon: <ShieldIcon sx={{ color: "#22c55e" }} />,
            title: "Seguridad",
            desc: "Monitoreo y manejo cuidadoso en toda la cadena.",
          },{
            icon: <LocalShippingIcon sx={{ color: "#f59e0b" }} />,
            title: "Cobertura",
            desc: "Red de transporte eficiente a nivel nacional.",
          }].map((f, idx) => (
            <Grid key={idx} item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {f.icon}
                  <Typography variant="h6" fontWeight={700}>{f.title}</Typography>
                </Box>
                <Typography sx={{ mt: 1.5, color: "text.secondary" }}>{f.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Container sx={{ pb: 8 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: 4,
            background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
            color: "#fff",
            textAlign: "center",
          }}
        >
          
          <Typography variant="h5" fontWeight={700}>
            ¿Listo para enviar tu próximo paquete?
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.9 }}>
            AtenciÃ³n al cliente 24/7 Â· {currentYear}
          </Typography>
          <Button
            variant="contained"
            sx={{
              mt: 3,
              bgcolor: "#111827",
              ":hover": { bgcolor: "#0b1220" },
              textTransform: "none",
            }}
            href="#rastreo"
          >
            Rastrear ahora
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default LandingPage;
