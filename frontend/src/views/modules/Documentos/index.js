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
  getDocumento,
  insertarDocumento,
  actualizarDocumento,
  eliminarDocumento,
} from "../../../services/modules/Documentos";

const Documentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    descripcion: "",
  });

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    try {
      const data = await getDocumento();
      // normaliza: [{id_tipo_doc, nombre, descripcion}] => [{id, nombre, descripcion}]
      const norm = (data || []).map((d) => ({
        id: d.id_tipo_doc ?? d.id,
        nombre: d.nombre ?? d.Nombre,
        descripcion: d.descripcion ?? d.Descripcion ?? "",
      }));
      setDocumentos(norm);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los documentos.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (doc = null) => {
    if (doc) {
      setFormData({ id: doc.id, nombre: doc.nombre, descripcion: doc.descripcion || "" });
    } else {
      setFormData({ id: null, nombre: "", descripcion: "" });
    }
    setOpen(true);
  };

  const handleCloseModal = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await actualizarDocumento({ id: formData.id, nombre: formData.nombre, descripcion: formData.descripcion });
        alert(`Tipo de documento "${formData.nombre}" actualizado.`);
      } else {
        await insertarDocumento({ nombre: formData.nombre, descripcion: formData.descripcion });
        alert(`Tipo de documento "${formData.nombre}" agregado.`);
      }
      fetchDocumentos();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este tipo de documento?")) {
      try {
        await eliminarDocumento(id);
        alert("Eliminado.");
        fetchDocumentos();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar.");
      }
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Descripción", selector: (row) => row.descripcion || "", sortable: true },
    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <IconButton color="primary" onClick={() => handleOpenModal(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  const customStyles = {
    headCells: { style: { backgroundColor: "#000", color: "#fff", fontWeight: "bold" } },
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Tipos de Documento</h1>

      <DataTable
        title="Lista"
        columns={columns}
        data={documentos}
        pagination
        highlightOnHover
        pointerOnHover
        customStyles={customStyles}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button variant="contained" onClick={() => handleOpenModal()}>
          Nuevo tipo
        </Button>
      </Box>

      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{formData.id ? "Editar tipo" : "Nuevo tipo"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">{formData.id ? "Actualizar" : "Guardar"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Documentos;
