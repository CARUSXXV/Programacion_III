const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// Rutas de la API
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

// Ruta de bienvenida de la API (opcional, ahora index.html será la raíz)
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'RetroVault API v1.0.0',
    status: 'online',
  });
});

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  // Si la ruta empieza por /api, responder con JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint de API no encontrado',
    });
  }
  // Si no, dejar que express.static maneje o enviar al index (para SPA)
  next();
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
