
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  getClientes,
  insertarCliente,
  actualizarCliente,
  eliminarCliente,
} from "../../../services/modules/Clientes";

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
      alert("Ocurrió un error al guardar el cliente.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await eliminarCliente(id);
        alert("Cliente eliminado exitosamente.");
        fetchClientes();
      } catch (error) {
        console.error("Error al eliminar cliente:", error);
        alert("Ocurrió un error al eliminar el cliente.");
      }
    }
  };

  const columns = [
    { name: "Nombre", selector: (row) => row.nombre, sortable: true },
    { name: "DPI", selector: (row) => row.dpi, sortable: true },
    { name: "NIT", selector: (row) => row.nit, sortable: true },
    { name: "Teléfono", selector: (row) => row.telefono, sortable: true },
    { name: "Dirección", selector: (row) => row.direccion, sortable: true },
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

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Clientes</h1>
      <Box display="flex" alignItems="center" gap="10px" marginBottom="20px">
        <TextField
          label="Buscar por DPI"
          value={searchDPI}
          onChange={(e) => setSearchDPI(e.target.value)}
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearchDPI}
          startIcon={<SearchIcon />}
        >
          Buscar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setFilteredClientes(clientes)}
        >
          Mostrar Todos
        </Button>
      </Box>
      <DataTable
        title="Lista de Clientes"
        columns={columns}
        data={filteredClientes}
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
          Ingresar Cliente
        </Button>
      </Box>
      <Dialog open={open} onClose={handleCloseModal}>
        <DialogTitle>{formData.id ? "Editar Cliente" : "Ingresar Cliente"}</DialogTitle>
        <DialogContent>
          <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="DPI" name="dpi" value={formData.dpi} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="NIT" name="nit" value={formData.nit} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Dirección" name="direccion" value={formData.direccion} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Correo" name="correo" value={formData.correo} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Código Postal" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Municipio" name="municipio" value={formData.municipio} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Departamento" name="departamento" value={formData.departamento} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="País" name="pais" value={formData.pais} onChange={handleChange} fullWidth margin="normal" />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.tiene_credito === 1}
                onChange={handleChange}
                name="tiene_credito"
              />
            }
            label="¿Tiene crédito?"
          />
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

export default Clientes;
