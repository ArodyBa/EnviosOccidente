const express = require("express");
const router = express.Router();
const controller = require("../controllers/comprasController");

router.post("/", controller.crearCompra);

module.exports = router;
