// server.js
const config = require('./config/environment');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ✅ NUEVO: auth
const authRoutes = require('./routes/auth'); // <-- agrega este archivo de rutas
const { verifyJWT } = require('./middlewares/auth.middleware'); // <-- tu middleware JWT

// Rutas negocio
const clientesRoutes = require('./routes/clientes');
const presatmosRoutes = require('./routes/prestamos');
const productosRoutes = require('./routes/productos');
const proveedoresRoutes = require('./routes/proveedores');
const comprasRoutes = require('./routes/compras');
const ventasRoutes = require('./routes/ventas');
const categoriasRoutes = require('./routes/categorias');
const abonosRoutes = require('./routes/abonos');
const reportes = require('./routes/reportes');
const correcciones = require('./routes/correcciones');
const facturacionRoutes = require('./routes/facturacionRoutes');
const facturasRoutes = require('./routes/facturas');
const tipoDocumentosRoutes = require('./routes/tipoDocumentos');
const papeleria = require('./routes/papeleria');
const enviosRoutes = require('./routes/envios');

const app = express();

// Confía en el proxy (cPanel) para detectar https correctamente
app.set('trust proxy', 1);

// ======== HOTFIX CORS ========
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowAllDev = (config.NODE_ENV === 'development');
  const allowed = /^https?:\/\/([a-z0-9-]+\.)*gtpos\.xyz$/i.test(origin || '');

  if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (allowAllDev || allowed) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Upload-Token');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// (Opcional) corsOptions clásico
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.NODE_ENV === 'development') return callback(null, true);
    const allowed = /^https?:\/\/([a-z0-9-]+\.)*gtpos\.xyz$/i;
    return allowed.test(origin) ? callback(null, true) : callback(new Error('No permitido por CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Upload-Token'],
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ ok: true, env: config.NODE_ENV, time: new Date().toISOString() });
});

// ======== ESTÁTICOS uploads ========
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ======== Multer ========
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = (req.query.subdir || '').replace(/^\/*/, '');
    const base = path.join(process.cwd(), 'uploads');
    const target = subdir ? path.join(base, subdir) : base;
    ensureDir(target);
    cb(null, target);
  },
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^\w.\- ]+/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const upload = multer({ storage });

// Subida con URL ABSOLUTA
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file' });

  const absUploads = path.join(process.cwd(), 'uploads') + path.sep;
  const relPath = req.file.path.replace(absUploads, '').replace(/\\/g, '/');

  const base = `${req.protocol}://${req.get('host')}`; // respeta https con trust proxy
  const publicUrl = `${base}/uploads/${relPath}`;

  res.json({
    ok: true,
    url: publicUrl,
    relative_path: `uploads/${relPath}`,
    name: req.file.originalname,
    mime_type: req.file.mimetype,
    size_bytes: req.file.size,
  });
});

// =================== 🔐 AUTH ===================
// Público:
app.use('/auth', authRoutes);

// =================== 🔒 RUTAS PROTEGIDAS ===================
// Si quieres proteger TODAS las rutas de negocio con JWT, descomenta este bloque:
// app.use(verifyJWT);

// O, si prefieres proteger por recurso, aplica verifyJWT en cada una según tu necesidad:

app.use('/clientes', verifyJWT, clientesRoutes);
app.use('/prestamos', verifyJWT, presatmosRoutes);
app.use('/productos', verifyJWT, productosRoutes);
app.use('/proveedores', verifyJWT, proveedoresRoutes);
app.use('/compras', verifyJWT, comprasRoutes);
app.use('/ventas', verifyJWT, ventasRoutes);
app.use('/categorias', verifyJWT, categoriasRoutes);
app.use('/abonos', verifyJWT, abonosRoutes);
app.use('/reportes', verifyJWT, reportes);
app.use('/correcciones', verifyJWT, correcciones);

// facturación podría tener endpoints públicos/privados, ajusta a tu flujo:
app.use('/facturacion', verifyJWT, facturacionRoutes);
app.use('/facturas', verifyJWT, facturasRoutes);
app.use('/tipo-documentos', verifyJWT, tipoDocumentosRoutes);
app.use('/papeleria', verifyJWT, papeleria);
app.use('/envios', verifyJWT, enviosRoutes);

// Tracking p�blico por c�digo (para landing)
app.get('/tracking/:code', async (req, res) => {
  try {
    const ctrl = require('./controllers/enviosController');
    return ctrl.getTrackingByCode(req, res);
  } catch (e) {
    res.status(500).json({ message: 'Error interno' });
  }
});
// ======== Arranque ========
console.log(`Servidor ejecutándose en modo: ${config.NODE_ENV}`);
app.listen(config.PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${config.PORT}`);
});


