import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, TextField, MenuItem, Typography, Grid, Card,
  CardHeader, CardContent, CardActions, Divider, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton, Paper, Stack,
  Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, Tooltip, Chip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { getProductos } from "../../../services/modules/Productos";
import { insertarCompra } from "../../../services/modules/Compras";
import { getProveedores } from "../../../services/modules/Proveedores";

const currencyAdornment = <InputAdornment position="start">Q</InputAdornment>;

const Compras = () => {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [detalleCompra, setDetalleCompra] = useState([]);

  const [idProveedor, setIdProveedor] = useState("");
  const [noFactura, setNoFactura] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoInput, setProductoInput] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");

  // Series dialog
  const [series, setSeries] = useState([]);
  const [openSeries, setOpenSeries] = useState(false);

  useEffect(() => {
    (async () => {
      const [productosData, proveedoresData] = await Promise.all([
        getProductos(),
        getProveedores(),
      ]);
      setProductos(productosData || []);
      setProveedores(proveedoresData || []);
    })();
  }, []);

  // Abre el diálogo de series automáticamente al tener producto + cantidad válidos
  useEffect(() => {
    if (productoSeleccionado && cantidad > 0) {
      setSeries(Array.from({ length: cantidad }, () => ""));
      setOpenSeries(true);
    }
  }, [productoSeleccionado, cantidad]);

  const totalCompra = useMemo(
    () => detalleCompra.reduce((acc, it) => acc + Number(it.total || 0), 0),
    [detalleCompra]
  );

  const limpiarProducto = () => {
    setProductoSeleccionado(null);
    setProductoInput("");
    setCantidad(0);
    setPrecioCompra("");
    setPrecioVenta("");
    setSeries([]);
  };

  const validarLinea = () => {
    if (!productoSeleccionado) return "Debe seleccionar un producto.";
    if (!cantidad || isNaN(cantidad) || cantidad <= 0) return "La cantidad debe ser mayor a 0.";
    if (!precioCompra || isNaN(precioCompra) || parseFloat(precioCompra) <= 0)
      return "Ingrese un precio de compra válido.";
    if (!precioVenta || isNaN(precioVenta) || parseFloat(precioVenta) <= 0)
      return "Ingrese un precio de venta válido.";
    if (series.length !== cantidad || series.some((s) => !String(s || "").trim()))
      return "Debe completar todas las series.";
    return null;
  };

  const agregarDetalle = () => {
    const error = validarLinea();
    if (error) {
      alert(error);
      return;
    }

    const prodIdSel = productoSeleccionado.id ?? productoSeleccionado.id_producto;
    const producto = productos.find((p) => (p.id ?? p.id_producto) === prodIdSel);
    if (!producto) {
      alert("Producto no encontrado en el catálogo.");
      return;
    }

    const costo = parseFloat(precioCompra);
    const pVenta = parseFloat(precioVenta);

    const nuevoDetalle = {
      id_producto: prodIdSel,
      descripcion: producto.descripcion,
      cantidad,
      precio_unitario: costo,
      precio_venta: pVenta,
      total: cantidad * costo,
      caducidad: null,
      series: [...series],
    };

    setDetalleCompra((prev) => [...prev, nuevoDetalle]);
    limpiarProducto();
    setOpenSeries(false);
  };

  const eliminarDetalle = (i) => {
    const copia = [...detalleCompra];
    copia.splice(i, 1);
    setDetalleCompra(copia);
  };

  const guardarCompra = async () => {
    if (!idProveedor) {
      alert("Seleccione un proveedor.");
      return;
    }
    if (!noFactura.trim()) {
      alert("Ingrese No. de factura.");
      return;
    }
    if (detalleCompra.length === 0) {
      alert("Agregue al menos un producto.");
      return;
    }

    const compra = {
      fecha,
      no_factura_compra: noFactura,
      id_proveedor: idProveedor,
      detalles: detalleCompra,
    };

    const res = await insertarCompra(compra);
    alert(res?.message || "Compra registrada exitosamente.");

    // Reset de todo y refrescar productos
    setDetalleCompra([]);
    setNoFactura("");
    const productosData = await getProductos();
    setProductos(productosData || []);
  };

  return (
    <Box p={2} pb={10}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Registrar Compra
      </Typography>

      {/* CARD: Datos de compra */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardHeader
          avatar={<ReceiptLongIcon />}
          title="Datos de la compra"
          titleTypographyProps={{ fontWeight: 600 }}
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Proveedor"
                select
                value={idProveedor}
                onChange={(e) => setIdProveedor(e.target.value)}
                fullWidth
              >
                {proveedores.map((p) => (
                  <MenuItem key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="No. Factura"
                value={noFactura}
                onChange={(e) => setNoFactura(e.target.value)}
                fullWidth
                placeholder="F-001-000123"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CARD: Agregar producto */}
      <Card elevation={1} sx={{ mb: 2 }}>
        <CardHeader
          avatar={<Inventory2Icon />}
          title="Agregar producto"
          titleTypographyProps={{ fontWeight: 600 }}
          action={
            <Tooltip title="Agregar al detalle">
              <span>
                <Button
                  startIcon={<PlaylistAddIcon />}
                  variant="contained"
                  onClick={() => setOpenSeries(true)}
                  disabled={!productoSeleccionado || !cantidad}
                >
                  Capturar series
                </Button>
              </span>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <Autocomplete
                freeSolo
                options={productos}
                getOptionLabel={(o) => o.descripcion || ""}
                value={productoSeleccionado}
                onChange={(e, nv) => setProductoSeleccionado(nv)}
                inputValue={productoInput}
                onInputChange={(e, nv) => setProductoInput(nv)}
                renderInput={(params) => (
                  <TextField {...params} label="Producto" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Cantidad"
                type="number"
                inputProps={{ min: 0, step: 1 }}
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 0)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Precio Compra"
                type="number"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: currencyAdornment }}
              />
            </Grid>

            <Grid item xs={12} sm={4} md={2}>
              <TextField
                label="Precio Venta"
                type="number"
                value={precioVenta}
                onChange={(e) => setPrecioVenta(e.target.value)}
                fullWidth
                InputProps={{ startAdornment: currencyAdornment }}
              />
            </Grid>

            <Grid item xs={12} md={1}>
              <Tooltip title="Agregar al detalle">
                <span>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={agregarDetalle}
                    disabled={!productoSeleccionado || !cantidad}
                  >
                    Agregar
                  </Button>
                </span>
              </Tooltip>
            </Grid>
          </Grid>

          {/* Chips de series cuando ya están cargadas */}
          {series?.length > 0 && (
            <Box mt={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {series.map((s, i) => (
                  <Chip key={i} size="small" label={s || `Serie ${i + 1}`} />
                ))}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CARD: Detalle de compra */}
      <Card elevation={1}>
        <CardHeader
          title="Detalle de compra"
          titleTypographyProps={{ fontWeight: 600 }}
        />
        <Divider />
        <CardContent sx={{ p: 0 }}>
          <Table component={Paper} sx={{
            "& tbody tr:nth-of-type(odd)": { backgroundColor: "action.hover" },
          }}>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Precio Unitario</TableCell>
                <TableCell align="right">Precio Venta</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="center">Eliminar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalleCompra.map((it, idx) => (
                <TableRow key={idx} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography fontWeight={600}>{it.descripcion}</Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {it.series?.map((s, i) => (
                          <Chip key={i} size="small" label={s} />
                        ))}
                      </Stack>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{it.cantidad}</TableCell>
                  <TableCell align="right">Q{Number(it.precio_unitario).toFixed(2)}</TableCell>
                  <TableCell align="right">Q{Number(it.precio_venta).toFixed(2)}</TableCell>
                  <TableCell align="right">Q{Number(it.total).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => eliminarDetalle(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography fontWeight={700}>Total:</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={700}>Q{totalCompra.toFixed(2)}</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>

        <CardActions sx={{
          position: "sticky", bottom: 0, zIndex: 2, justifyContent: "flex-end",
          bgcolor: "background.paper", borderTop: (t) => `1px solid ${t.palette.divider}`
        }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={guardarCompra}
          >
            Guardar compra
          </Button>
        </CardActions>
      </Card>

      {/* DIALOG: Captura de series */}
      <Dialog open={openSeries} onClose={() => setOpenSeries(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Capturar series ({cantidad || 0})</DialogTitle>
        <DialogContent dividers>
          {cantidad > 0 ? (
            <Grid container spacing={1}>
              {Array.from({ length: cantidad }).map((_, idx) => (
                <Grid item xs={12} sm={6} key={idx}>
                  <TextField
                    label={`Serie ${idx + 1}`}
                    value={series[idx] || ""}
                    onChange={(e) => {
                      const nuevas = [...series];
                      nuevas[idx] = e.target.value.toUpperCase();
                      setSeries(nuevas);
                    }}
                    fullWidth
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Define primero la cantidad para generar los campos de series.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeries(false)}>Cerrar</Button>
          <Button onClick={agregarDetalle} variant="contained">Agregar al detalle</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Compras;
