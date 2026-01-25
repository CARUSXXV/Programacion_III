const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_default';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token
 * @param {number} payload.id - ID del usuario
 * @param {string} payload.email - Email del usuario
 * @param {string} payload.rol - Rol del usuario
 * @returns {string} Token JWT generado
 */
const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, {
  expiresIn: JWT_EXPIRES_IN,
});

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token a verificar
 * @returns {Object} Payload decodificado
 * @throws {Error} Si el token es inválido o ha expirado
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
