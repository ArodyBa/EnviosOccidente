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
  getProveedores,
  insertarProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../../../services/modules/Proveedores";

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
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
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    setLoading(true);
    try {
      const data = await getProveedores();
      setProveedores(data || []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (proveedor = null) => {
    if (proveedor) {
      setFormData({ ...proveedor });
    } else {
      setFormData({
        id: null,
        nombre: "",
        nit: "",
        dpi: "",
        direccion: "",
        telefono: "",
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
      if (formData.id) {
        await actualizarProveedor(formData);
        alert(`Proveedor ${formData.nombre} actualizado.`);
      } else {
        await insertarProveedor(formData);
        alert(`Proveedor ${formData.nombre} agregado.`);
      }
      fetchProveedores();
      handleCloseModal();
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      alert("Ocurrió un error al guardar el proveedor.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
      try {
        await eliminarProveedor(id);
        alert("Proveedor eliminado exitosamente.");
        fetchProveedores();
      } catch (error) {
        console.error("Error al eliminar proveedor:", error);
        alert("Ocurrió un error al eliminar el proveedor.");
      }
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "NIT", selector: (row) => row.nit, sortable: true },
    { name: "DPI", selector: (row) => row.dpi, sortable: true },
    { name: "Teléfono", selector: (row) => row.telefono, sortable: true },
    { name: "Dirección", selector: (row) => row.direccion, sortable: true },
    {
      name: "Acciones",
      cell: (row) => (
        <Box display="flex" gap={1}>
          <IconButton color="primary" onClick={() => handleOpenModal(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon />
          </IconButton>
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
      <h1>Proveedores</h1>

      <DataTable
        title="Lista de Proveedores"
        columns={columns}
        data={proveedores}
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
        <DialogTitle>{formData.id ? "Editar Proveedor" : "Ingresar Proveedor"}</DialogTitle>
        <DialogContent>
          <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="NIT" name="nit" value={formData.nit} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="DPI" name="dpi" value={formData.dpi} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth margin="normal" />
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

export default Proveedores;
