// src/views/reportes/ReporteCompras.jsx
import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Paper,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getReporteComprasPorFecha } from "../../../services/modules/Correcciones";
import ModalSeriesDetalleCompra from "./ModalSeriesDetalleCompra";

const ReporteCompras = () => {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [compras, setCompras] = useState([]);
  const [idCompraSeleccionada, setIdCompraSeleccionada] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const buscar = async () => {
    if (!desde || !hasta) return alert("Seleccione un rango de fechas");
    const data = await getReporteComprasPorFecha(desde, hasta);
    setCompras(data);
  };

  const abrirModal = (id) => {
    setIdCompraSeleccionada(id);
    setModalOpen(true);
  };

  return (
    <Paper style={{ padding: 20 }}>
      <h2>Reporte de Compras</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <TextField
          type="date"
          label="Desde"
          InputLabelProps={{ shrink: true }}
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
        />
        <TextField
          type="date"
          label="Hasta"
          InputLabelProps={{ shrink: true }}
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
        />
        <Button variant="contained" onClick={buscar}>Buscar</Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>No. Factura</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Productos</TableCell>
            <TableCell>Series</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {compras.map((compra) => (
            <TableRow key={compra.id_compra}>
              <TableCell>{compra.id_compra}</TableCell>
              <TableCell>{compra.no_factura_compra}</TableCell>
              <TableCell>{compra.fecha}</TableCell>
              <TableCell>{compra.total_productos}</TableCell>
              <TableCell>{compra.total_series}</TableCell>
              <TableCell>
                <IconButton onClick={() => abrirModal(compra.id_compra)}>
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ModalSeriesDetalleCompra
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        idCompra={idCompraSeleccionada}
      />
    </Paper>
  );
};

export default ReporteCompras;
