// src/components/Menu.jsx
import React, { useMemo, useState } from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Collapse } from '@mui/material';
import * as Icons from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const resolveIcon = (name) => {
  if (!name) return Icons.DashboardOutlined;
  const base = String(name).trim();
  const candidates = [base, base.endsWith('Icon') ? base : `${base}Icon`, base.replace(/Icon$/,'')];
  for (const c of candidates) if (Icons[c]) return Icons[c];
  return Icons.DashboardOutlined;
};
const pretty = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

export default function Menu() {
  const { menus = [], logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState({});

  // ← agrupa DINÁMICAMENTE por m.grupo y ordena
  const groups = useMemo(() => {
    const map = new Map();
    for (const m of menus) {
      const key = (m.grupo || 'otros').toLowerCase();
      if (!map.has(key)) map.set(key, { key, label: pretty(key), items: [] });
      map.get(key).items.push(m);
    }
    // ordena items del grupo
    map.forEach(g => g.items.sort((a,b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre)));
    // ordena grupos alfabéticamente (si luego agregas grupo_orden lo usamos)
    return [...map.values()].sort((a,b) => (a.orden ?? 999) - (b.orden ?? 999) || a.label.localeCompare(b.label));
  }, [menus]);

  const toggle = k => setOpen(s => ({ ...s, [k]: !s[k] }));
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <Drawer variant="permanent" sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing:'border-box' }}}>
      <Toolbar />
      <List>
        {groups.map(g => (
          <React.Fragment key={g.key}>
            <ListItemButton onClick={() => toggle(g.key)}>
              <ListItemIcon><Icons.Folder /></ListItemIcon>
              <ListItemText primary={g.label} />
              {open[g.key] ? <Icons.ExpandLess /> : <Icons.ExpandMore />}
            </ListItemButton>
            <Collapse in={!!open[g.key]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {g.items.map(m => {
                  const IconCmp = resolveIcon(m.icono);
                  return (
                    <ListItemButton key={m.id} component={Link} to={m.ruta} sx={{ pl: 4 }}>
                      <ListItemIcon><IconCmp /></ListItemIcon>
                      <ListItemText primary={m.nombre} />
                    </ListItemButton>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        ))}

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><Icons.Logout /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}
