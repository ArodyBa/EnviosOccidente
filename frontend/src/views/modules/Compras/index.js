import React, { useState, useEffect } from "react";
import {
  Box, Button, TextField, MenuItem, Typography, Grid,
  Table, TableHead, TableRow, TableCell, TableBody, Autocomplete, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { getProductos } from "../../../services/modules/Productos";
import { insertarCompra } from "../../../services/modules/Compras";
import { getProveedores } from "../../../services/modules/Proveedores";

const Compras = () => {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [detalleCompra, setDetalleCompra] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoInput, setProductoInput] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [precioVenta, setPrecioVenta] = useState("");
  const [caducidad, setCaducidad] = useState("");
  const [idProveedor, setIdProveedor] = useState("");
  const [noFactura, setNoFactura] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [series, setSeries] = useState([]);
  const [precioCompra, setPrecioCompra] = useState("");




  useEffect(() => {
    const cargarDatos = async () => {
      const productosData = await getProductos();
      const proveedoresData = await getProveedores();
      setProductos(productosData);
      setProveedores(proveedoresData);
    };
    cargarDatos();
  }, []);
  /*
    const agregarDetalle = () => {
      if (productoSeleccionado && cantidad > 0) {
        const producto = productos.find(p => p.id === productoSeleccionado.id);
        const nuevoDetalle = {
          id_producto: producto.id,
          descripcion: producto.descripcion,
          cantidad,
          precio_unitario: producto.precio_compra,
          total: cantidad * producto.precio_compra,
          precio_venta: parseFloat(precioVenta),
          caducidad
        };
        setDetalleCompra(prev => [...prev, nuevoDetalle]);
        setCantidad(1);
        setPrecioVenta("");
        setCaducidad("");
        setProductoSeleccionado(null);
        setProductoInput("");
      }
    };
  */
  const agregarDetalle = () => {
    if (cantidad <= 0) {
      alert("La cantidad no puede ser 0 o menor.");
      return;
    }
    if (!precioVenta || parseFloat(precioVenta) <= 0) {
      alert("Debe ingresar un precio de venta válido.");
      return;
    }
    if (productoSeleccionado && cantidad > 0) {
      // Validar que todas las series estén completas
      if (series.length !== cantidad || series.some(s => !s.trim())) {
        alert("Debe ingresar todas las series");
        return;
      }


      const producto = productos.find(p => p.id === productoSeleccionado.id);
      const nuevoDetalle = {
        id_producto: producto.id,
        descripcion: producto.descripcion,
        cantidad,
        precio_unitario: producto.precio_compra,
        total: cantidad * producto.precio_compra,
        precio_venta: parseFloat(precioVenta),
        caducidad,
        series // aquí se guarda el array de series
      };

      setDetalleCompra(prev => [...prev, nuevoDetalle]);

      // Reset
      setCantidad(1);
      setPrecioVenta("");
      setCaducidad("");
      setProductoSeleccionado(null);
      setProductoInput("");
      setSeries([]); // limpia las series
    }
  };

  const eliminarDetalle = (index) => {
    const copia = [...detalleCompra];
    copia.splice(index, 1);
    setDetalleCompra(copia);
  };

  const guardarCompra = async () => {
    if (!idProveedor) {
      alert("Debe seleccionar un proveedor.");
      return;
    }
    const compra = {
      fecha,
      no_factura_compra: noFactura,
      id_proveedor: idProveedor,
      detalles: detalleCompra
    };
    const res = await insertarCompra(compra);
    alert(res.message);
    setDetalleCompra([]);
  };

  const calcularTotal = () => {
    return detalleCompra.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <Box p={3}>
      <Typography variant="h5">Registrar Compra</Typography>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Proveedor"
            select
            value={idProveedor}
            onChange={(e) => setIdProveedor(e.target.value)}
            fullWidth
          >
            {proveedores.map(p => (
              <MenuItem key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="No. Factura"
            value={noFactura}
            onChange={(e) => setNoFactura(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Cantidad"
            type="number"
            value={cantidad}
            onChange={(e) => {
              const nuevaCantidad = parseInt(e.target.value);
              setCantidad(nuevaCantidad);
              setSeries(Array(nuevaCantidad).fill(""));
            }}
            fullWidth  // Esto asegurará que use el espacio del grid
          />
        </Grid>

        <Grid item xs={6}>
          <Autocomplete
            freeSolo
            options={productos}
            getOptionLabel={(option) => option.descripcion || ""}
            value={productoSeleccionado}
            onChange={(event, newValue) => setProductoSeleccionado(newValue)}
            inputValue={productoInput}
            onInputChange={(event, newInputValue) => setProductoInput(newInputValue)}
            renderInput={(params) => <TextField {...params} label="Producto" fullWidth />}
          />
          {productoSeleccionado && cantidad > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1">Ingrese las series:</Typography>
              {series.map((serie, index) => (
                <TextField
                  key={index}
                  label={`Serie ${index + 1}`}
                  value={serie}
                  onChange={(e) => {
                    const nuevas = [...series];
                    nuevas[index] = e.target.value;
                    setSeries(nuevas);
                  }}
                  fullWidth
                  margin="dense"
                />
              ))}
            </Box>
          )}

        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Precio Compra"
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={3}>

          <TextField
            label="Precio Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <Button fullWidth variant="contained" onClick={agregarDetalle}>Agregar</Button>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6">Detalle de Compra</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Precio Unitario</TableCell>
              <TableCell>Precio Venta</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Eliminar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {detalleCompra.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.descripcion}</TableCell>
                <TableCell>{item.cantidad}</TableCell>
                <TableCell>Q{item.precio_unitario}</TableCell>
                <TableCell>Q{item.precio_venta}</TableCell>
                <TableCell>Q{item.total}</TableCell>
                <TableCell>
                  <IconButton onClick={() => eliminarDetalle(idx)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right"><strong>Total:</strong></TableCell>
              <TableCell colSpan={3}>Q{calcularTotal().toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Box mt={3}>
        <Button variant="contained" color="success" onClick={guardarCompra}>Guardar Compra</Button>
      </Box>
    </Box>
  );
};

export default Compras;
