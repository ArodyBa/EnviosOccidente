const express = require("express");
const router = express.Router();
const {
  getCategorias,
  insertarCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require("../controllers/categoriasController");

router.get("/", getCategorias);
router.post("/", insertarCategoria);
router.put("/:id", actualizarCategoria);
router.delete("/:id", eliminarCategoria);

module.exports = router;
