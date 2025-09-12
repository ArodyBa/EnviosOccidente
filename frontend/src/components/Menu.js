import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar,
  Collapse
} from '@mui/material';
import {
  ExpandLess, ExpandMore,
  People as PeopleIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  ShoppingCart as ShoppingCartIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Folder as FolderIcon,
  Work as WorkIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,     // <- nuevo (Tipos de doc)
  Assignment as AssignmentIcon        // <- nuevo (Papelería)
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Menu = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [openCatalogo, setOpenCatalogo] = useState(false);
  const [openOperaciones, setOpenOperaciones] = useState(false);
  const [openReportes, setOpenReportes] = useState(false);
  const [openPapeleria, setOpenPapeleria] = useState(false); // <- nuevo

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>

        {/* Menú Catálogo */}
        <ListItem button onClick={() => setOpenCatalogo(!openCatalogo)}>
          <ListItemIcon><FolderIcon /></ListItemIcon>
          <ListItemText primary="Catálogo" />
          {openCatalogo ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openCatalogo} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/clientes" sx={{ pl: 4 }}>
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Clientes" />
            </ListItem>
            <ListItem button component={Link} to="/proveedores" sx={{ pl: 4 }}>
              <ListItemIcon><StoreIcon /></ListItemIcon>
              <ListItemText primary="Proveedores" />
            </ListItem>
            <ListItem button component={Link} to="/productos" sx={{ pl: 4 }}>
              <ListItemIcon><InventoryIcon /></ListItemIcon>
              <ListItemText primary="Productos" />
            </ListItem>
            <ListItem button component={Link} to="/calibres" sx={{ pl: 4 }}>
              <ListItemIcon><CategoryIcon /></ListItemIcon>
              <ListItemText primary="Calibres" />
            </ListItem>
            <ListItem button component={Link} to="/facturas" sx={{ pl: 4 }}>
              <ListItemIcon><StoreIcon /></ListItemIcon>
              <ListItemText primary="Facturas" />
            </ListItem>
          </List>
        </Collapse>

        {/* Menú Operaciones */}
        <ListItem button onClick={() => setOpenOperaciones(!openOperaciones)}>
          <ListItemIcon><WorkIcon /></ListItemIcon>
          <ListItemText primary="Operaciones" />
          {openOperaciones ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openOperaciones} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/compras" sx={{ pl: 4 }}>
              <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
              <ListItemText primary="Compras" />
            </ListItem>
            <ListItem button component={Link} to="/ventas" sx={{ pl: 4 }}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Ventas" />
            </ListItem>
            <ListItem button component={Link} to="/abonos" sx={{ pl: 4 }}>
              <ListItemIcon><reporDashboardIconIcon /></ListItemIcon>
              <ListItemText primary="Abonos" />
            </ListItem>
            <ListItem button component={Link} to="/correcciones" sx={{ pl: 4 }}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Correcciones" />
            </ListItem>
          </List>
        </Collapse>

        {/* Papelería (nuevo módulo) */}
        <ListItem button onClick={() => setOpenPapeleria(!openPapeleria)}>
          <ListItemIcon><AssignmentIcon /></ListItemIcon>
          <ListItemText primary="Papelería" />
          {openPapeleria ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openPapeleria} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/documentos" sx={{ pl: 4 }}>
              <ListItemIcon><DescriptionIcon /></ListItemIcon>
              <ListItemText primary="Tipos de Documento" />
            </ListItem>
            <ListItem button component={Link} to="/papeleria" sx={{ pl: 4 }}>
              <ListItemIcon><AssignmentIcon /></ListItemIcon>
              <ListItemText primary="Papelería por Cliente" />
            </ListItem>
          </List>
        </Collapse>

        {/* Menú Reportes */}
        <ListItem button onClick={() => setOpenReportes(!openReportes)}>
          <ListItemIcon><AssessmentIcon /></ListItemIcon>
          <ListItemText primary="Reportes" />
          {openReportes ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={openReportes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/reportes/compras" sx={{ pl: 4 }}>
              <ListItemIcon><AssessmentIcon /></ListItemIcon>
              <ListItemText primary="Reporte de Compras" />
            </ListItem>
          </List>
        </Collapse>

        {/* Cerrar sesión */}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Cerrar Sesión" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Menu;
