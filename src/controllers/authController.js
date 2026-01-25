const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

/**
 * Controlador para registrar un nuevo usuario
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const {
      nombre, email, password, rol = 'client',
    } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      nombre,
      email,
      password,
      rol,
    });

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: newUser,
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message,
    });
  }
};

/**
 * Controlador para autenticar un usuario (login)
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await User.comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol,
    });

    // Remover contraseña de la respuesta
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

/**
 * Controlador para obtener el perfil del usuario autenticado
 * @route GET /api/auth/perfil
 */
const getPerfil = async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware authenticate
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    console.error('Error en getPerfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getPerfil,
};
