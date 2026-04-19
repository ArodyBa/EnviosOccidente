import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import * as Icons from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const drawerWidth = 280;

export const resolveIcon = (name) => {
  if (!name) return Icons.DashboardOutlined;
  const base = String(name).trim();
  const candidates = [
    base,
    base.endsWith("Icon") ? base : `${base}Icon`,
    base.replace(/Icon$/, ""),
  ];
  for (const c of candidates) if (Icons[c]) return Icons[c];
  return Icons.DashboardOutlined;
};

const pretty = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

export function MenuContent({ onNavigate }) {
  const { menus = [], logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState({});

  const groups = useMemo(() => {
    const map = new Map();
    for (const m of menus) {
      const key = (m.grupo || "otros").toLowerCase();
      if (!map.has(key)) map.set(key, { key, label: pretty(key), items: [] });
      map.get(key).items.push(m);
    }

    map.forEach((g) =>
      g.items.sort(
        (a, b) =>
          (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre)
      )
    );

    return [...map.values()].sort(
      (a, b) =>
        (a.orden ?? 999) - (b.orden ?? 999) || a.label.localeCompare(b.label)
    );
  }, [menus]);

  useEffect(() => {
    const current = groups.find((g) =>
      g.items.some((m) => m.ruta === location.pathname)
    );
    if (current) setOpen((s) => ({ ...s, [current.key]: true }));
  }, [groups, location.pathname]);

  const toggle = (k) => setOpen((s) => ({ ...s, [k]: !s[k] }));
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <List sx={{ px: 0.5, pb: 2 }}>
      {groups.map((g) => (
        <React.Fragment key={g.key}>
          <ListItemButton onClick={() => toggle(g.key)}>
            <ListItemIcon>
              <Icons.Folder />
            </ListItemIcon>
            <ListItemText
              primary={g.label}
              secondary={g.items.length ? `${g.items.length} opciones` : null}
              secondaryTypographyProps={{ sx: { opacity: 0.75 } }}
            />
            {open[g.key] ? <Icons.ExpandLess /> : <Icons.ExpandMore />}
          </ListItemButton>
          <Collapse in={!!open[g.key]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {g.items.map((m) => {
                const IconCmp = resolveIcon(m.icono);
                const selected = location.pathname === m.ruta;
                return (
                  <ListItemButton
                    key={m.id}
                    component={Link}
                    to={m.ruta}
                    selected={selected}
                    onClick={onNavigate}
                    sx={{ pl: 4.5 }}
                  >
                    <ListItemIcon>
                      <IconCmp />
                    </ListItemIcon>
                    <ListItemText primary={m.nombre} />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </React.Fragment>
      ))}

      <Divider sx={{ mx: 2, my: 1.5 }} />
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <Icons.Logout />
        </ListItemIcon>
        <ListItemText primary="Cerrar Sesión" />
      </ListItemButton>
    </List>
  );
}

export default function Menu({ open = true, onClose, variant = "permanent" }) {
  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar sx={{ px: 2.25 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background:
                "linear-gradient(135deg, var(--eo-primary), var(--eo-primary2))",
            }}
          />
          <Box>
            <Typography fontWeight={900} lineHeight={1.1}>
              Envios Occidente
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Administración
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ mx: 2, my: 1 }} />
      <MenuContent onNavigate={onClose} />
    </Drawer>
  );
}
