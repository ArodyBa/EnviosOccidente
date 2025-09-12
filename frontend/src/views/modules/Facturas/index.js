import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Button,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getFacturas,
  anularFactura,
  anularVenta,
} from "../../../services/modules/Facturas";

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    dpi: "",
    direccion: "",
    telefono: "",
  });

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await getFacturas();
      setFacturas(data || []);
    } catch (err) {
      console.error("Error al cargar facturas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (factura = null) => {
    if (factura) {
      setFormData({ ...factura });
    } else {
      setFormData({
        id_documento: null,
        nit_cliente: "",
        uuid: "",
        serie: "",
        numero_documento: "",
        fecha_emision: "",
        estado: "",
        descripcion_anulacion: "",
      });
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

  };

  const handleSubmit = async () => {
    try {

      const facturar = {
        nitEmisor: "107346834",
        nombreEmisor: "TEKRA SOCIEDAD ANONIMA",
        nitReceptor: formData.nit_cliente,
        idventa: formData.id_venta,
        NumeroDocumentoAAnular: formData.uuid,
        FechaEmisionDocumentoAnular: formData.fecha_emision,
        MotivoAnulacion: formData.descripcion_anulacion,
      }

      const resFactura = await anularFactura(facturar);
      if (resFactura.exitoso) {
        // generarPDFFactura(res, resFactura);
        // alert(`Proveedor ${formData.nombre} actualizado.`);
        const Anulacion = {
          idVenta: formData.id_venta
        }
        console.log(Anulacion);
        alert(`Factura Anulada Exitosamente.`);
        anularVenta(Anulacion);
      }
      fetchFacturas();
      handleCloseModal();
    } catch (error) {
      console.error("Error al intentar Anular la Factura:", error);
      alert("Ocurrió un error al intentar Anular la Factura.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        // await eliminarProveedor(id);
        alert("Proveedor eliminado exitosamente.");
        fetchFacturas();
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        alert("Ocurrió un error al eliminar el proveedor.");
      }
    }
  };

  const columns = [
    { name: "Nit Cliente", selector: (row) => row.nit_cliente, sortable: true },
    { name: "Autorizacion", selector: (row) => row.uuid, sortable: true },
    { name: "Serie", selector: (row) => row.serie, sortable: true },
    { name: "Numero", selector: (row) => row.numero_documento, sortable: true },
    { name: "Fecha Emision", selector: (row) => row.fecha_emision, sortable: true },
    { name: "Estado", selector: (row) => row.estado, sortable: true },
    { name: "Fecha Anulación", selector: (row) => row.fecha_anulacion, sortable: true },
    { name: "Motivo Anulación", selector: (row) => row.descripcion_anulacion, sortable: true },
    {
      name: "Acciones",
      cell: (row) => (
        <Box display="flex" gap={1}>
          {row.estado !== "Anulado" && (
            <IconButton color="primary" onClick={() => handleOpenModal(row)}>
              <EditIcon />
            </IconButton>
          )}
          {/* <IconButton color="error" onClick={() => handleDelete(row.id_documento)}>
            <DeleteIcon />
          </IconButton> */}
        </Box>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        backgroundColor: "#000000",
        color: "#ffffff",
        fontWeight: "bold",
        textAlign: "center",
      },
    },
    rows: {
      style: {
        "&:hover": {
          backgroundColor: "#f0f0f0",
        },
      },
    },
    cells: {
      style: {
        textAlign: "left",
      },
    },
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Facturas</h1>

      <DataTable
        title="Listado de Facturas"
        columns={columns}
        data={facturas}
        pagination
        highlightOnHover
        pointerOnHover
        customStyles={customStyles}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <Button variant="contained" color="error" onClick={() => alert("Salir del sistema")}>
          Salir
        </Button>
        <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
          Ingresar Proveedor
        </Button>
      </Box>

      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{formData.id ? "Motivo de Anulación de Factura" : ""}</DialogTitle>
        <DialogContent>
          <TextField label="Descrilpción Anulación" name="descripcion_anulacion" value={formData.descripcion_anulacion} onChange={handleChange} fullWidth margin="normal"
            multiline
            rows={4} // Puedes ajustar el número de filas visibles
            inputProps={{ maxLength: 100 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {formData.id ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Facturas;
