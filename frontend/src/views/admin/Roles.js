import React, { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SearchIcon from "@mui/icons-material/Search";
import { dataTableStylesDark } from "../../styles/dataTableStyles";
import { obtenerMenus } from "../../services/modules/Menus";
import { crearRol, guardarMenusPorRol, obtenerMenusPorRol, obtenerRoles } from "../../services/modules/Roles";

export default function RolesAdmin() {
  const [roles, setRoles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState("");

  const [permOpen, setPermOpen] = useState(false);
  const [permRole, setPermRole] = useState(null); // {id,nombre}
  const [menus, setMenus] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState([]);
  const [permLoading, setPermLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerRoles();
      setRoles(data || []);
      setFiltered(data || []);
    } catch (e) {
      setError("Error al cargar roles.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const q = String(search || "").toLowerCase().trim();
    if (!q) return setFiltered(roles);
    setFiltered((roles || []).filter((r) => String(r.nombre || "").toLowerCase().includes(q)));
  }, [search, roles]);

  const columns = useMemo(
    () => [
      { name: "ID", selector: (row) => row.id, sortable: true, width: "100px" },
      { name: "Nombre", selector: (row) => row.nombre, sortable: true },
      {
        name: "Permisos",
        cell: (row) => (
          <Button
            size="small"
            variant="outlined"
            startIcon={<SettingsRoundedIcon />}
            onClick={() => openPerms(row)}
          >
            Vistas
          </Button>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "170px",
      },
    ],
    []
  );

  const handleOpen = () => {
    setNombre("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNombre("");
  };

  const openPerms = async (role) => {
    setPermRole(role);
    setPermOpen(true);
    setError(null);
    setPermLoading(true);
    try {
      const [menusData, selected] = await Promise.all([
        obtenerMenus(),
        obtenerMenusPorRol(role.id),
      ]);
      setMenus((menusData || []).filter((m) => Number(m.activo) === 1));
      setSelectedMenus((selected || []).map((n) => Number(n)));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error cargando permisos.";
      setError(String(msg));
      console.error(e);
    } finally {
      setPermLoading(false);
    }
  };

  const closePerms = () => {
    setPermOpen(false);
    setPermRole(null);
    setMenus([]);
    setSelectedMenus([]);
    setPermLoading(false);
  };

  const toggleMenu = (menuId, checked) => {
    const id = Number(menuId);
    setSelectedMenus((prev) => {
      const set = new Set(prev.map((n) => Number(n)));
      if (checked) set.add(id);
      else set.delete(id);
      return [...set.values()];
    });
  };

  const savePerms = async () => {
    if (!permRole?.id) return;
    setError(null);
    setPermLoading(true);
    try {
      await guardarMenusPorRol(permRole.id, selectedMenus);
      closePerms();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Error guardando permisos.";
      setError(String(msg));
      console.error(e);
    } finally {
      setPermLoading(false);
    }
  };

  const menusByGroup = useMemo(() => {
    const map = new Map();
    for (const m of menus) {
      const key = String(m.grupo || "otros").toLowerCase();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0) || String(a.nombre).localeCompare(String(b.nombre)));
      map.set(k, arr);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [menus]);

  const submit = async () => {
    setError(null);
    const n = String(nombre || "").trim();
    if (!n) return setError("Nombre requerido.");
    try {
      await crearRol({ nombre: n });
      await fetchRoles();
      handleClose();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? "Rol ya existe." : null) ||
        e?.message ||
        "Error creando rol.";
      setError(String(msg));
      console.error(e);
    }
  };

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
              Roles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crea roles para luego asignarlos a usuarios.
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleOpen} startIcon={<AddRoundedIcon />}>
            Nuevo rol
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 1.5 }} alignItems="center">
          <SearchIcon />
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por nombre"
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
        <DialogTitle>Crear rol</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={submit}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={permOpen} onClose={closePerms} fullWidth maxWidth="md">
        <DialogTitle>
          Permisos de vistas{permRole?.nombre ? ` — ${permRole.nombre}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          {permLoading ? (
            <Typography color="text.secondary">Cargando…</Typography>
          ) : menus.length ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Esto controla qué opciones aparecen en el menú para este rol.
              </Typography>
              {menusByGroup.map(([group, items]) => (
                <Box key={group}>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    {group}
                  </Typography>
                  <FormGroup>
                    {items.map((m) => (
                      <FormControlLabel
                        key={m.id}
                        control={
                          <Checkbox
                            checked={selectedMenus.includes(Number(m.id))}
                            onChange={(e) => toggleMenu(m.id, e.target.checked)}
                          />
                        }
                        label={`${m.nombre} (${m.ruta})`}
                      />
                    ))}
                  </FormGroup>
                  <Divider sx={{ my: 1.5 }} />
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">No hay menús activos en la BD.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePerms}>Cancelar</Button>
          <Button variant="contained" onClick={savePerms} disabled={permLoading || !permRole?.id}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
