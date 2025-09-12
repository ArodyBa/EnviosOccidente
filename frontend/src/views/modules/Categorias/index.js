import React, { useEffect, useState } from "react";
import {
  Box, Button, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton
} from "@mui/material";
import DataTable from "react-data-table-component";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getCategorias, insertarCategoria,
  actualizarCategoria, eliminarCategoria
} from "../../../services/modules/Categorias";

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: null, nombre: "", descripcion: "" });

  const fetchCategorias = async () => {
    const data = await getCategorias();
    setCategorias(data);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleOpen = (cat = null) => {
    if (cat) setForm({ id: cat.id_categoria, nombre: cat.nombre, descripcion: cat.descripcion });
    else setForm({ id: null, nombre: "", descripcion: "" });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (form.id) {
      await actualizarCategoria(form.id, form);
    } else {
      await insertarCategoria(form);
    }
    fetchCategorias();
    handleClose();
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar Calibre?")) {
      await eliminarCategoria(id);
      fetchCategorias();
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "Descripción", selector: (row) => row.descripcion },
    {
      name: "Acciones",
      cell: (row) => (
        <>
          <IconButton onClick={() => handleOpen(row)} color="primary"><EditIcon /></IconButton>
          <IconButton onClick={() => handleDelete(row.id_categoria)} color="error"><DeleteIcon /></IconButton>
        </>
      )
    }
  ];

  return (
    <Box p={3}>
      <h2>Calibres</h2>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Nuevo Calibre
      </Button>

      <DataTable
        columns={columns}
        data={categorias}
        pagination
        highlightOnHover
      />

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{form.id ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="normal" label="Nombre"
            name="nombre" value={form.nombre} onChange={handleChange}
          />
          <TextField
            fullWidth margin="normal" label="Descripción"
            name="descripcion" value={form.descripcion} onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {form.id ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categorias;
