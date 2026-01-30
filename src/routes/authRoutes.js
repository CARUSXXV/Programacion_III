const express = require('express');
const { register, login, getPerfil } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post('/register', validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener token
 * @access  Público
 */
router.post('/login', validateLogin, login);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Privado (requiere token)
 */
router.get('/perfil', authenticate, getPerfil);

module.exports = router;
