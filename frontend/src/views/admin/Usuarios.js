import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
  Typography,
  Select,
  FormControlLabel,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { dataTableStylesDark } from "../../styles/dataTableStyles";
import {
  actualizarUsuario,
  crearUsuario,
  eliminarUsuario,
  obtenerUsuarios,
} from "../../services/modules/UsuariosService";
import { obtenerRoles } from "../../services/modules/Roles";

const emptyForm = {
  id: null,
  usuario: "",
  correo: "",
  password: "",
  estado: true,
  roles: [],
};

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);

  const roleById = useMemo(() => {
    const m = new Map();
    for (const r of roles) m.set(Number(r.id), r);
    return m;
  }, [roles]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        obtenerUsuarios(),
        obtenerRoles(),
      ]);
      setUsuarios(usersData || []);
      setFiltered(usersData || []);
      setRoles(rolesData || []);
    } catch (e) {
      setError("Error al cargar usuarios/roles.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const q = String(search || "").toLowerCase().trim();
    if (!q) return setFiltered(usuarios);
    setFiltered(
      (usuarios || []).filter(
        (u) =>
          String(u.usuario || "").toLowerCase().includes(q) ||
          String(u.correo || "").toLowerCase().includes(q)
      )
    );
  }, [search, usuarios]);

  const handleOpen = (u = null) => {
    if (!u) {
      setForm(emptyForm);
      setOpen(true);
      return;
    }
    setForm({
      id: u.id,
      usuario: u.usuario || "",
      correo: u.correo || "",
      password: "",
      estado: Boolean(u.estado),
      roles: (u.roles || []).map((r) => Number(r.id)),
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyForm);
  };

  const submit = async () => {
    try {
      const payload = {
        usuario: form.usuario.trim(),
        correo: form.correo.trim(),
        estado: form.estado ? 1 : 0,
        roles: form.roles,
      };

      if (!form.id) {
        if (!form.password) return setError("Password requerido para crear usuario.");
        await crearUsuario({ ...payload, password: form.password });
      } else {
        const updatePayload = { ...payload };
        if (form.password) updatePayload.password = form.password;
        await actualizarUsuario(form.id, updatePayload);
      }

      await fetchAll();
      handleClose();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error guardando usuario.";
      setError(String(msg));
      console.error(e);
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm("¿Desactivar este usuario?")) return;
    try {
      await eliminarUsuario(id);
      await fetchAll();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error desactivando usuario.";
      setError(String(msg));
      console.error(e);
    }
  };

  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "80px" },
    { name: "Usuario", selector: (row) => row.usuario, sortable: true },
    { name: "Correo", selector: (row) => row.correo || "", sortable: true },
    {
      name: "Estado",
      selector: (row) => (Number(row.estado) === 1 ? "Activo" : "Inactivo"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Roles",
      cell: (row) => (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {(row.roles || []).map((r) => (
            <Chip key={`${row.id}-${r.id}`} size="small" label={r.nombre} />
          ))}
        </Stack>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpen(row)}
            startIcon={<EditIcon />}
          >
            Editar
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => deactivate(row.id)}
            startIcon={<DeleteIcon />}
          >
            Desactivar
          </Button>
        </Stack>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "260px",
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crear usuarios y asignar múltiples roles.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => handleOpen(null)}
            startIcon={<AddRoundedIcon />}
          >
            Nuevo usuario
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1.5 }} alignItems="center">
          <SearchIcon />
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por usuario o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Stack>

        {error ? (
          <Typography color="error" sx={{ mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <DataTable
          columns={columns}
          data={filtered}
          progressPending={loading}
          pagination
          highlightOnHover
          dense
          customStyles={dataTableStylesDark}
        />
      </Paper>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? "Editar usuario" : "Crear usuario"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Usuario"
              value={form.usuario}
              onChange={(e) => setForm((s) => ({ ...s, usuario: e.target.value }))}
              fullWidth
              disabled={!!form.id}
            />
            <TextField
              label="Correo"
              value={form.correo}
              onChange={(e) => setForm((s) => ({ ...s, correo: e.target.value }))}
              fullWidth
            />
            <TextField
              label={form.id ? "Password (opcional)" : "Password"}
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                multiple
                value={form.roles}
                onChange={(e) =>
                  setForm((s) => ({ ...s, roles: e.target.value.map((v) => Number(v)) }))
                }
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) =>
                  selected
                    .map((id) => roleById.get(Number(id))?.nombre || `#${id}`)
                    .join(", ")
                }
              >
                {(roles || []).map((r) => (
                  <MenuItem key={r.id} value={Number(r.id)}>
                    <Checkbox checked={form.roles.includes(Number(r.id))} />
                    <ListItemText primary={r.nombre} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.estado}
                  onChange={(e) => setForm((s) => ({ ...s, estado: e.target.checked }))}
                />
              }
              label="Activo"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={submit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
