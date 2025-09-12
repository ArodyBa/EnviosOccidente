import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import { registrarPrestamo, getClientePorDPI } from "../../../services/modules/Prestamos";
import { jsPDF } from "jspdf";

const CrearPrestamo = () => {
  const [formData, setFormData] = useState({
    dpi: "",
    monto: "",
    cuotas: "",
    interes: "",
    valor_cuota: 0,
    total_a_pagar: 0,
    cliente_nombre: "",
  });

  const [error, setError] = useState("");

  // Manejar cambios en los campos
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (name === "dpi") {
      setFormData((prev) => ({ ...prev, dpi: value, cliente_nombre: "" }));
      if (value.length > 0) {
        try {
          const cliente = await getClientePorDPI(value);
          setFormData((prev) => ({
            ...prev,
            cliente_nombre: `${cliente.nombres} ${cliente.apellidos}`,
          }));
          setError("");
        } catch (error) {
          console.error("Error al buscar cliente:", error);
          setError("Cliente no encontrado");
          setFormData((prev) => ({ ...prev, cliente_nombre: "" }));
        }
      }
    }

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      if (name === "monto" || name === "cuotas" || name === "interes") {
        const monto = parseFloat(newFormData.monto || 0);
        const cuotas = parseInt(newFormData.cuotas || 0);
        const interes = parseFloat(newFormData.interes || 0);
        if (monto > 0 && cuotas > 0 && interes >= 0) {
          const total = monto + monto * (interes / 100);
          newFormData.valor_cuota = (total / cuotas).toFixed(2);
          newFormData.total_a_pagar = total.toFixed(2);
        }
      }

      return newFormData;
    });
  };

  // Generar PDF después de registrar el préstamo
  const generarPDF = (datos) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("NOMBRE DEL NEGOCIO", 10, 10);
    doc.setFontSize(12);
    doc.text("Slogan del negocio", 10, 20);
    doc.setFontSize(10);
    doc.text(`Cliente: ${datos.cliente_nombre}`, 10, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 10, 40);
    doc.text(`Cantidad: Q${datos.monto}`, 10, 50);
    doc.text(`Cantidad Cuotas: ${datos.cuotas}`, 10, 60);
    doc.text(`Total Préstamo: Q${datos.total_a_pagar}`, 10, 70);
    doc.text("Gracias por su confianza", 10, 90);
    
    // Descargar el PDF
    doc.save(`Prestamo_${datos.dpi}.pdf`);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registrarPrestamo({
        dpi: formData.dpi,
        monto: formData.monto,
        cuotas: formData.cuotas,
        interes: formData.interes,
      });
      alert(response.message);

      // Generar el PDF con los datos ingresados
      generarPDF(formData);
      
    } catch (error) {
      console.error("Error al registrar el préstamo:", error);
      alert(error.message || "Error al registrar el préstamo");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <h1>Registrar Préstamo</h1>
      <TextField
        label="DPI del Cliente"
        name="dpi"
        value={formData.dpi}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      {formData.cliente_nombre && (
        <p style={{ color: "green" }}>Cliente: {formData.cliente_nombre}</p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <TextField
        label="Monto"
        name="monto"
        type="number"
        value={formData.monto}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Cuotas"
        name="cuotas"
        type="number"
        value={formData.cuotas}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Interés (%)"
        name="interes"
        type="number"
        value={formData.interes}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Valor de la Cuota"
        value={`Q${formData.valor_cuota}`}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
      />
      <TextField
        label="Total a Pagar"
        value={`Q${formData.total_a_pagar}`}
        fullWidth
        margin="normal"
        InputProps={{
          readOnly: true,
        }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Registrar Préstamo
      </Button>
    </Box>
  );
};

export default CrearPrestamo;
