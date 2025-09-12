const express = require("express");
const router = express.Router();
const controller = require("../controllers/productosController");

router.get("/unidades", controller.getUnidadesMedida);
router.get("/tipos-precio", controller.getTiposPrecio);
router.post("/", controller.crearProducto);
router.get("/", controller.getProductos);

// ❌ Estas funciones no existen aún, comenta o elimínalas
// router.get("/con-series", controller.getProductosConSerie);


module.exports = router;
