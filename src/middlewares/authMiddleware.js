const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

/**
 * Middleware para verificar que el usuario esté autenticado
 * Extrae el token del header Authorization y verifica su validez
 */
const authenticate = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado. Acceso denegado.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = verifyToken(token);

    // Verificar que el usuario existe en la base de datos
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado. Token inválido.',
      });
    }

    // Agregar información del usuario al request
    req.user = user;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token inválido o expirado',
    });
  }
};

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * @param {string[]} roles - Array de roles permitidos
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado',
    });
  }

  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a este recurso',
    });
  }

  return next();
};

module.exports = {
  authenticate,
  authorize,
};
