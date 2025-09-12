import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../views/auth/Login';
import Dashboard from '../views/dashboard/Dashboard';
import Welcome from '../views/welcome';
import Clientes from '../views/modules/Clientes';
import Prestamos from '../views/modules/Prestamos';
import Proveedores from '../views/modules/Proveedores';
import Facturas from '../views/modules/Facturas';
import Productos from '../views/modules/Productos';
import Compras from '../views/modules/Compras';
import Ventas from '../views/modules/Ventas';
import Abonos from '../views/modules/Abonos'
import Calibres from '../views/modules/Categorias'
import Reportes from '../views/modules/Reportes'
import Prestamosclientes from '../views/modules/PrestamosClientes';
import Correcciones from '../views/modules/Correcciones'
import ReporteCompras from '../views/modules/Reportes/ReporteCompras';

import Documentos from '../views/modules/Documentos';   // ⬅️ NUEVO (Tipos de documento)
import Papeleria from '../views/modules/Papeleria';     // ⬅️ NUEVO (Papelería por cliente)

import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from "../views/LandingPage"; // Importar el componente LandingPage
import FloatingWhatsApp from "../components/FloatingWhatsAppButton";


const AppRoutes = () => {
  // Definimos las rutas protegidas en un array para evitar repetición
  const protectedRoutes = [
    { path: '/dashboard', component: <Dashboard /> },
    { path: '/clientes', component: <Clientes /> },
    { path: '/prestamos', component: <Prestamos /> },
    { path: '/proveedores', component: <Proveedores /> },
    { path: '/facturas', component: <Facturas /> },
    { path: '/productos', component: <Productos /> },
    { path: '/compras', component: <Compras /> },
    { path: '/ventas', component: <Ventas /> },
    { path: '/abonos', component: <Abonos /> },
    { path: '/calibres', component: <Calibres /> },
    { path: '/reportes', component: <Reportes /> },
    { path: '/prestamosclientes', component: <Prestamosclientes /> },
    { path: '/correcciones', component: <Correcciones /> },
    { path: '/reportes/compras', component: <ReporteCompras /> },

    // ⬇️ Nuevas rutas
    { path: '/documentos', component: <Documentos /> }, // CRUD TipoDocumento
    { path: '/papeleria', component: <Papeleria /> },   // Lista papelería por cliente

  ];

  return (
    <Router>
      <Routes>
        {/* Ruta de Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        {protectedRoutes.map(({ path, component }, index) => (
          <Route
            key={index}
            path={path}
            element={
              <ProtectedRoute>
                <Layout>{component}</Layout>
              </ProtectedRoute>
            }
          />
        ))}

        {/* (opcional) 404 simple */}
        {/* <Route path="*" element={<div style={{padding:20}}>Página no encontrada</div>} /> */}
      </Routes>
      {/* Botón flotante de WhatsApp */}
      <FloatingWhatsApp />

    </Router>
  );
};

export default AppRoutes;
