import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { insertarProducto, getProductos } from "../../../services/modules/Productos";
import { getCategorias } from "../../../services/modules/Categorias";

const Productos = () => {
  const [formData, setFormData] = useState({
    id: null,
    codigo: "",
    descripcion: "",
    id_categoria: "",
    precio_compra: "",
    precio_venta: "",
    modelo: "",
    cantidad_inicial: 0,
    nivel_minimo: 0
  });

  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    const cargarProductos = async () => {
      try {
        const data = await getProductos();
        setProductos(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };

    cargarCategorias();
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditar = (producto) => {
    setFormData({
      id: producto.id,
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      id_categoria: producto.id_categoria,
      precio_compra: producto.precio_compra,
      precio_venta: producto.precio_venta,
      modelo: producto.modelo?.split("T")[0] || "",
      cantidad_inicial: producto.cantidad_inicial,
      nivel_minimo: producto.nivel_minimo
    });
  };

  const handleGuardarProducto = async () => {
    try {
      const producto = {
        ...formData,
        cantidad_inicial: formData.cantidad_inicial || 0,
        nivel_minimo: formData.nivel_minimo || 0
      };
      const res = await insertarProducto(producto);
      alert(res.message);
      const updated = await getProductos();
      setProductos(updated);
      setFormData({
        id: null,
        codigo: "",
        descripcion: "",
        id_categoria: "",
        precio_compra: "",
        precio_venta: "",
        modelo: "",
        cantidad_inicial: 0,
        nivel_minimo: 0
      });
    } catch (error) {
      alert("Error al guardar el producto");
      console.error(error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Registrar Producto
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Código"
            name="codigo"
            value={formData.codigo}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Calibre"
            name="id_categoria"
            select
            value={formData.id_categoria}
            onChange={handleChange}
            fullWidth
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Modelo"
            name="modelo"
         
            value={formData.modelo}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Precio de Compra"
            name="precio_compra"
            type="number"
            value={formData.precio_compra}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Precio de Venta"
            name="precio_venta"
            type="number"
            value={formData.precio_venta}
            onChange={handleChange}
            fullWidth
          />
        </Grid>



        <Grid item xs={12} sm={6}>
          <TextField
            label="Cantidad Inicial"
            name="cantidad_inicial"
            type="number"
            value={formData.cantidad_inicial}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Nivel Mínimo"
            name="nivel_minimo"
            type="number"
            value={formData.nivel_minimo}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Box mt={4}>
        <Button variant="contained" color="success" onClick={handleGuardarProducto}>
          {formData.id ? "Actualizar Producto" : "Guardar Producto"}
        </Button>
      </Box>

      <Box mt={6}>
        <Typography variant="h6" gutterBottom>
          Productos Registrados
        </Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio Compra</TableCell>
              <TableCell>Precio Venta</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
<TableBody>
  {productos.map((prod) => {
    const precio1 = parseFloat(prod.precio_venta);
    const precio2 = (precio1 * 1.5).toFixed(2);
    const precio3 = (precio1 * 1.75).toFixed(2);

    return (
      <TableRow key={prod.id}>
        <TableCell>{prod.codigo}</TableCell>
        <TableCell>{prod.descripcion}</TableCell>
        <TableCell>{prod.categoria}</TableCell>
        <TableCell>Q{prod.precio_compra}</TableCell>
        <TableCell>
          <strong>1:</strong> Q{precio1} <br />
          <strong>2:</strong> Q{precio2} <br />
          <strong>3:</strong> Q{precio3}
        </TableCell>
        <TableCell>{prod.cantidad_inicial}</TableCell>
        <TableCell>
          <IconButton color="primary" onClick={() => handleEditar(prod)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  })}
</TableBody>

        </Table>
      </Box>
    </Box>
  );
};

export default Productos;
