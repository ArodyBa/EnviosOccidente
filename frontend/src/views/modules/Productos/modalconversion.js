import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ModalConversion = ({ open, onClose, unidades, conversiones, setConversiones }) => {
  const [data, setData] = useState({
    unidad_origen_id: "",
    unidad_destino_id: "",
    factor_conversion: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = () => {
    if (!data.unidad_origen_id || !data.unidad_destino_id || !data.factor_conversion) return;
    setConversiones([...conversiones, { ...data, factor_conversion: parseFloat(data.factor_conversion) }]);
    setData({ unidad_origen_id: "", unidad_destino_id: "", factor_conversion: "" });
  };

  const handleEliminar = (index) => {
    const copia = [...conversiones];
    copia.splice(index, 1);
    setConversiones(copia);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Agregar Conversiones de Unidad</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={4}>
            <TextField
              label="Unidad Origen"
              name="unidad_origen_id"
              select
              value={data.unidad_origen_id}
              onChange={handleChange}
              fullWidth
            >
              {unidades.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Unidad Destino"
              name="unidad_destino_id"
              select
              value={data.unidad_destino_id}
              onChange={handleChange}
              fullWidth
            >
              {unidades.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Factor de Conversión"
              name="factor_conversion"
              type="number"
              value={data.factor_conversion}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
        <Button variant="contained" color="primary" onClick={handleAgregar} sx={{ mt: 2 }}>
          Agregar Conversión
        </Button>

        <Table sx={{ mt: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Unidad Origen</TableCell>
              <TableCell>Unidad Destino</TableCell>
              <TableCell>Factor</TableCell>
              <TableCell>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversiones.map((c, i) => (
              <TableRow key={i}>
                <TableCell>{unidades.find(u => u.id === parseInt(c.unidad_origen_id))?.nombre}</TableCell>
                <TableCell>{unidades.find(u => u.id === parseInt(c.unidad_destino_id))?.nombre}</TableCell>
                <TableCell>{c.factor_conversion}</TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => handleEliminar(i)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalConversion;
