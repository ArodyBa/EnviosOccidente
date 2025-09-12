import React, { useState } from "react";
import { Fab, Box, Typography, Modal, Button } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const FloatingWhatsApp = () => {
  const [open, setOpen] = useState(false);

  const phoneNumber = "50233648949"; // Número de WhatsApp
  const message = "Hola, estoy interesado en sus productos. ¿Podría darme más información?";

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank"); // Abre el enlace en una nueva pestaña
  };

  return (
    <>
      {/* Botón flotante */}
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Fab
          color="success"
          aria-label="WhatsApp"
          onClick={handleOpen}
          sx={{ boxShadow: 3 }}
        >
          <WhatsAppIcon />
        </Fab>
      </Box>

      {/* Modal de información */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="whatsapp-modal-title"
        aria-describedby="whatsapp-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            bottom: 80,
            right: 16,
            width: 300,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Typography id="whatsapp-modal-title" variant="h6" color="success.main" gutterBottom>
            Estamos listos para ayudarte.
          </Typography>
          <Typography id="whatsapp-modal-description" variant="body2" color="text.secondary">
            ¿Tienes alguna duda? ¡Contáctanos por WhatsApp y te responderemos lo antes posible!
          </Typography>
          <Button
            variant="contained"
            color="success"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleWhatsAppClick}
          >
            <WhatsAppIcon sx={{ mr: 1 }} />
            WhatsApp
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default FloatingWhatsApp;
