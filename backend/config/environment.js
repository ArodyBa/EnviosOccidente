// config/environment.js
const path = require('path');

// Si no hay NODE_ENV definido, usar 'development' o 'production' por defecto
const NODE_ENV = process.env.NODE_ENV || 'production';

// Cargar .env base primero
require('dotenv').config();

// Luego cargar el archivo específico del entorno (sobrescribe variables duplicadas)
const envFile = `.env.${NODE_ENV}`;
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

const config = {
  // Configuración general
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT) || 3000,
  
  // Base de datos
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  
};

// Validar variables críticas
/* const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingVars = requiredVars.filter(varName => !config[varName]); 

if (missingVars.length > 0) {
  console.error(`Error: Las siguientes variables de entorno son requeridas: ${missingVars.join(', ')}`);
  process.exit(1); 
} */

module.exports = config;