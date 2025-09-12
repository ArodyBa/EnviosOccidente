import React, { useState, useEffect } from "react";
import { getClientes } from "../../../services/modules/Clientes";
import { getPrestamosByCliente, getCuotasByPrestamo, registrarPagoCuota } from "../../../services/modules/Prestamos";
import DataTable from "react-data-table-component";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";

const PrestamosCliente = () => {
  const [clientes, setClientes] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [cuotas, setCuotas] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedPrestamo, setSelectedPrestamo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openPrestamos, setOpenPrestamos] = useState(false);
  const [openCuotas, setOpenCuotas] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data || []);
    } catch (error) {
      console.error("Error al cargar los clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrestamos = async (id_cliente) => {
    try {
      setSelectedCliente(id_cliente);
      const data = await getPrestamosByCliente(id_cliente);
      setPrestamos(data || []);
      setOpenPrestamos(true);
    } catch (error) {
      console.error("Error al obtener préstamos:", error);
    }
  };

  const fetchCuotas = async (id_prestamo) => {
    try {
      setSelectedPrestamo(id_prestamo);
      const data = await getCuotasByPrestamo(id_prestamo);
      setCuotas(data || []);
      setOpenCuotas(true);
    } catch (error) {
      console.error("Error al obtener cuotas:", error);
    }
  };

  const handlePagoCuota = async (id_cuota) => {
    if (window.confirm("¿Deseas registrar el pago de esta cuota?")) {
      try {
        await registrarPagoCuota(id_cuota);
        alert("Pago registrado exitosamente.");
        fetchCuotas(selectedPrestamo); // Refresca las cuotas después del pago
      } catch (error) {
        console.error("Error al registrar el pago:", error.response || error.message);
        alert(`Error al registrar el pago: ${error.response?.data?.message || error.message}`);
      }
    }
  };
  

  const columnsClientes = [
    { name: "Nombre", selector: (row) => row.nombres, sortable: true },
    { name: "Apellido", selector: (row) => row.apellidos, sortable: true },
    { name: "DPI", selector: (row) => row.dpi, sortable: true },
    {
      name: "Acciones",
      cell: (row) => (
        <IconButton color="primary" onClick={() => fetchPrestamos(row.id)}>
          <VisibilityIcon />
        </IconButton>
      ),
    },
  ];

  const columnsPrestamos = [
    {
      name: "Monto",
      selector: (row) => {
        const monto = parseFloat(row.monto); // Convertir a número
        return !isNaN(monto) ? `Q${monto.toFixed(2)}` : "Monto no válido"; // Validar y formatear
      },
      sortable: true,
    },
    {
      name: "Cuotas",
      selector: (row) => row.cuotas || "No especificado", // Mostrar mensaje si el dato no está
      sortable: true,
    },
    {
      name: "Saldo",
      selector: (row) => {
        const saldo = parseFloat(row.saldo); // Convertir a número
        return !isNaN(saldo) ? `Q${saldo.toFixed(2)}` : "Saldo no válido"; // Validar y formatear
      },
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) => (
        <IconButton color="primary" onClick={() => fetchCuotas(row.id)}>
          <VisibilityIcon />
        </IconButton>
      ),
      ignoreRowClick: true, // Evitar que el botón accione al hacer clic en la fila
      allowOverflow: true,
      button: true,
    },
  ];
  

  const columnsCuotas = [
    {
      name: "N° Cuota",
      selector: (row) => row.numero_cuota || "No especificado", // Validar datos no definidos
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => {
        const monto = parseFloat(row.monto); // Convertir a número
        return !isNaN(monto) ? `Q${monto.toFixed(2)}` : "Monto no válido"; // Validar y formatear
      },
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => (row.estado === 1 ? "Pagado" : "Pendiente"),
      sortable: true,
    },
    {
      name: "Fecha Pago",
      selector: (row) => row.fecha_pago || "No pagada", // Mostrar mensaje si no hay fecha
      sortable: true,
    },
    {
      name: "Acciones",
      cell: (row) =>
        row.estado === 0 && ( // Mostrar botón solo para cuotas pendientes
          <IconButton color="success" onClick={() => handlePagoCuota(row.id)}>
            <PaymentIcon />
          </IconButton>
        ),
      ignoreRowClick: true, // Evitar interacción con la fila al hacer clic en el botón
      allowOverflow: true,
      button: true,
    },
  ];
  
  if (loading) return <p>Cargando clientes...</p>;

  return (
    <Box sx={{ padding: 3 }}>
      <h1>Gestión de Préstamos</h1>
      <DataTable title="Clientes" columns={columnsClientes} data={clientes} pagination highlightOnHover />

      {/* Modal de Préstamos */}
      <Dialog open={openPrestamos} onClose={() => setOpenPrestamos(false)} maxWidth="md" fullWidth>
        <DialogTitle>Préstamos del Cliente</DialogTitle>
        <DialogContent>
          <DataTable columns={columnsPrestamos} data={prestamos} pagination highlightOnHover />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrestamos(false)} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Cuotas */}
      <Dialog open={openCuotas} onClose={() => setOpenCuotas(false)} maxWidth="md" fullWidth>
        <DialogTitle>Cuotas del Préstamo</DialogTitle>
        <DialogContent>
          <DataTable columns={columnsCuotas} data={cuotas} pagination highlightOnHover />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCuotas(false)} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PrestamosCliente;
