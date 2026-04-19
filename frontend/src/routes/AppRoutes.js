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

import Documentos from '../views/modules/Documentos';
import NuevoEnvio from '../views/modules/Envios';
import SeguimientoEnvios from '../views/modules/SeguimientoEnvios';
import SliderConfig from '../views/modules/SliderConfig';
import { Estados as EstadosEnvio, TiposTarifas as TiposTarifasEnvio } from '../views/modules/EnviosCatalogos';
import About from '../views/About';
import Precios from '../views/Precios';
import Caja from '../views/modules/Caja';
import Chat from '../views/chat/Chat';
import UsuariosAdmin from '../views/admin/Usuarios';
import RolesAdmin from '../views/admin/Roles';
import NoAutorizado from '../views/NoAutorizado';

import ProtectedRoute from '../components/ProtectedRoute';
import LandingPage from "../views/LandingPage"; // Importar el componente LandingPage
import FloatingTelegramButton from "../components/FloatingTelegramButton";


const AppRoutes = () => {
  // Definimos las rutas protegidas en un array para evitar repeticiÃ³n
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
    { path: '/envios', component: <NuevoEnvio /> },
    { path: '/documentos', component: <Documentos /> }, // CRUD TipoDocumento
    { path: '/enviosestados', component: <EstadosEnvio /> },
    { path: '/enviostipos', component: <TiposTarifasEnvio /> },
    { path: '/seguimiento', component: <SeguimientoEnvios /> },
    { path: '/configurarslider', component: <SliderConfig /> },
    { path: '/configurar/slider', component: <SliderConfig /> },
    { path: '/caja', component: <Caja /> },
    { path: '/chat', component: <Chat /> },
    { path: '/usuarios', component: <UsuariosAdmin />, rolesAllowed: ['Admin'] },
    { path: '/roles', component: <RolesAdmin />, rolesAllowed: ['Admin'] },

  ];
  return (
    <Router>
      <Routes>
        {/* Ruta de Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/precios" element={<Precios />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />

        {/* Rutas protegidas */}
        {protectedRoutes.map(({ path, component, rolesAllowed }, index) => (
          <Route
            key={index}
            path={path}
            element={
              <ProtectedRoute rolesAllowed={rolesAllowed}>
                <Layout>{component}</Layout>
              </ProtectedRoute>
            }
          />
        ))}

        {/* (opcional) 404 simple */}
        {/* <Route path="*" element={<div style={{padding:20}}>PÃ¡gina no encontrada</div>} /> */}
      </Routes>
      {/* BotÃ³n flotante de WhatsApp */}
      <FloatingTelegramButton />

    </Router>
  );
};

export default AppRoutes;














