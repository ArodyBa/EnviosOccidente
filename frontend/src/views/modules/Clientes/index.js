
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
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  getClientes,
  insertarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../../services/modules/Clientes";
import { dataTableStylesDark } from "../../../styles/dataTableStyles";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchDPI, setSearchDPI] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    nombre: "",
    dpi: "",
    nit: "",
    direccion: "",
    telefono: "",
    correo: "",
    codigo_postal: "",
    municipio: "",
    departamento: "",
    pais: "GT",
    tiene_credito: false,
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const data = await getClientes();
      setClientes(data || []);
      setFilteredClientes(data || []);
    } catch (err) {
      setError("Error al cargar los clientes.");
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setFormData({
        id: cliente.id_cliente,
        ...cliente,
        tiene_credito: Boolean(cliente.tiene_credito),
      });
    } else {
      setFormData({
        id: null,
        nombre: "",
        dpi: "",
        nit: "",
        direccion: "",
        telefono: "",
        correo: "",
        codigo_postal: "",
        municipio: "",
        departamento: "",
        pais: "GT",
        tiene_credito: false,
      });
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleSearchDPI = () => {
    const filtered = clientes.filter((cliente) =>
      cliente.dpi.includes(searchDPI)
    );
    setFilteredClientes(filtered);
  };

  const handleSubmit = async () => {
    try {
      const existingCliente = clientes.find(
        (cliente) => cliente.dpi === formData.dpi && cliente.id !== formData.id
      );
      if (existingCliente) {
        alert(`Ya existe un cliente registrado con el DPI ${formData.dpi}`);
        return;
      }

      if (formData.id) {
        await actualizarCliente(formData);
        alert(`Cliente ${formData.nombre} actualizado.`);
      } else {
        await insertarCliente(formData);
        alert(`Cliente ${formData.nombre} agregado.`);
      }
      fetchClientes();
      handleCloseModal();
      console.log(formData)
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("OcurriÃ³ un error al guardar el cliente.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Â¿EstÃ¡s seguro de que deseas eliminar este cliente?")) {
      try {
        await eliminarCliente(id);
        alert("Cliente eliminado exitosamente.");
        fetchClientes();
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("OcurriÃ³ un error al eliminar el cliente.");
      }
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "DPI", selector: (row) => row.dpi, sortable: true },
    { name: "NIT", selector: (row) => row.nit, sortable: true },
    { name: "TelÃ©fono", selector: (row) => row.telefono, sortable: true },
    { name: "DirecciÃ³n", selector: (row) => row.direccion, sortable: true },
    { name: "Saldo", selector: (row) => `Q${parseFloat(row.Saldo || 0).toFixed(2)}`, sortable: true },

    {
      name: "Acciones",
      cell: (row) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <IconButton color="primary" onClick={() => handleOpenModal(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = dataTableStylesDark;

  if (loading) return <Typography color="text.secondary">Cargando...</Typography>;

  if (error) return <Typography color="error.main">{error}</Typography>;

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4">Clientes</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Alta, edición y busqueda Rápida.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpenModal()}
          startIcon={<AddRoundedIcon />}
        >
          Nuevo cliente
        </Button>
      </Stack>

      <Paper sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            label="Buscar por DPI"
            value={searchDPI}
            onChange={(e) => setSearchDPI(e.target.value)}
            variant="outlined"
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSearchDPI}
            startIcon={<SearchIcon />}
          >
            Buscar
          </Button>
          <Button variant="outlined" onClick={() => setFilteredClientes(clientes)}>
            Mostrar todos
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <DataTable
            columns={columns}
            data={filteredClientes}
            pagination
            highlightOnHover
            pointerOnHover
            responsive
            dense
            customStyles={customStyles}
          />
        </Box>
      </Paper>
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{formData.id ? "Editar Cliente" : "Ingresar Cliente"}</DialogTitle>
        <DialogContent>
          <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="DPI" name="dpi" value={formData.dpi} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="NIT" name="nit" value={formData.nit} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="DirecciÃ³n" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="TelÃ©fono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Correo" name="correo" value={formData.correo} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="CÃ³digo Postal" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="PaÃ­s" name="pais" value={formData.pais} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.tiene_credito === 1}
                onChange={handleChange}
                name="tiene_credito"
              />
            }
            label="Â¿Tiene crÃ©dito?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="secondary">Cancelar</Button>
          <Button onClick={handleSubmit} color="primary">
            {formData.id ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clientes;



