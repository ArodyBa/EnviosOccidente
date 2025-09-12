import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import { getClientes } from "../../../services/modules/Clientes";
import { registrarAbono } from "../../../services/modules/Abonos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoAGOP from "../../../assets/Logo.png";
const generarPDFAbono = (cliente, abono, saldoRestante) => {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString();

  const img = new Image();
  img.src = logoAGOP;

  img.onload = () => {
    doc.addImage(img, "PNG", 10, 10, 40, 20);

    doc.setFontSize(18);
    doc.text("RECIBO DE ABONO", 105, 30, { align: "center" });

    doc.setFontSize(12);
    doc.text("Armerías AGOP", 15, 40);
    doc.text("Dirección: 2da. Avenida, Zona 1, Malacatán, San Marcos", 15, 46);
    doc.text("Tel: 7937-4297", 15, 52);
    doc.text("Confianza y Seguridad en un mismo lugar", 15, 58);

    doc.text(`Fecha: ${fecha}`, 150, 40);
    doc.text(`Cliente: ${cliente.nombre}`, 150, 46);
    doc.text(`NIT: ${cliente.nit || "CF"}`, 150, 52);

    autoTable(doc, {
      startY: 70,
      head: [["Monto Abonado", "Observaciones", "Saldo Restante"]],
      body: [[
        `Q${abono.monto.toFixed(2)}`,
        abono.observaciones || "Sin observaciones",
        `Q${saldoRestante.toFixed(2)}`
      ]],
      styles: {
        halign: "center",
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        cellPadding: 3
      },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255]
      },
      theme: "grid"
    });

    doc.save(`Abono_${cliente.nombre}.pdf`);
  };
};

const Abonos = () => {
  const [clientes, setClientes] = useState([]);
  const [idCliente, setIdCliente] = useState("");
  const [monto, setMonto] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const cargarClientes = async () => {
      const data = await getClientes();
      setClientes(data);
    };
    cargarClientes();
  }, []);

  const handleGuardar = async () => {
    if (!idCliente || !monto) {
      alert("Debe seleccionar un cliente y monto válido");
      return;
    }

    const abono = {
      id_cliente: idCliente,
      monto: parseFloat(monto),
      observaciones
    };
  const clienteSeleccionado = clientes.find(c => c.id_cliente === idCliente); // <- Mueve esto arriba

    const res = await registrarAbono(abono);
    alert(res.message);
  const saldoRestante = clienteSeleccionado?.Saldo
    ? clienteSeleccionado.Saldo - abono.monto
    : 0;
    
    generarPDFAbono(clienteSeleccionado, abono, saldoRestante);
    setIdCliente("");
    setMonto("");
    setObservaciones("");
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Registrar Abono</Typography>
      <TextField
        select label="Cliente" value={idCliente}
        onChange={(e) => setIdCliente(e.target.value)} fullWidth margin="normal"
      >
        {clientes.map(c => (
          <MenuItem key={c.id_cliente} value={c.id_cliente}>
            {c.nombre}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="Monto a Abonar" type="number" fullWidth
        value={monto} onChange={(e) => setMonto(e.target.value)} margin="normal"
      />

      <TextField
        label="Observaciones" multiline rows={2} fullWidth
        value={observaciones} onChange={(e) => setObservaciones(e.target.value)} margin="normal"
      />

      <Button variant="contained" color="success" onClick={handleGuardar}>
        Guardar Abono
      </Button>
    </Box>
  );
};

export default Abonos;
