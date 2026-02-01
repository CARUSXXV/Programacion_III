const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Ruta de bienvenida de la API (solo si no se encuentra un archivo estático)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a RetroVault API - Sistema de E-commerce de Videojuegos Retro',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        perfil: 'GET /api/auth/perfil (requiere token)',
      },
      products: {
        getAll: 'GET /api/products (requiere token)',
        getByCodigo: 'GET /api/products/:codigo (requiere token)',
        create: 'POST /api/products (requiere token admin)',
      },
    },
  });
});

// Manejo de rutas no encontradas (para la API)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint de API no encontrado',
  });
});

// Para cualquier otra ruta, servir el index.html (Soporte para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de errores global
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
  });
});

module.exports = app;
