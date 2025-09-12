const express = require("express");
const router = express.Router();
const controller = require("../controllers/ventasController");

router.post("/", controller.crearVenta);
router.get("/tipos-documento", controller.getTiposDocumento);
router.get("/tipos-venta", controller.getTiposVenta);

// ✅ Nueva ruta para validar series en tiempo real
router.post("/series/validar", controller.validarSeries);

router.post("/anular-venta", controller.anularVenta);

module.exports = router;
