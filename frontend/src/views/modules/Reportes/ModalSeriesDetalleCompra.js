// src/views/reportes/ModalSeriesDetalleCompra.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { getSeriesDetallePorCompra } from "../../../services/modules/Correcciones";

const ModalSeriesDetalleCompra = ({ open, onClose, idCompra }) => {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (open && idCompra) {
      getSeriesDetallePorCompra(idCompra).then(setSeries);
    }
  }, [open, idCompra]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Series y Productos - Compra #{idCompra}</DialogTitle>
      <DialogContent>
        {series.length === 0 ? (
          <p>No hay series registradas.</p>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Serie</TableCell>
                <TableCell>Producto</TableCell>
                <TableCell>Serie</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {series.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell>{item.serie}</TableCell>
                  <TableCell>
                    {parseInt(item.estado) === 0 ? "Disponible" : "Vendida"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSeriesDetalleCompra;
