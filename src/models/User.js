const bcrypt = require('bcrypt');
const { getDatabase } = require('../config/database');

const SALT_ROUNDS = 10;

class User {
  /**
   * Crea un nuevo usuario en la base de datos
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.nombre - Nombre completo
   * @param {string} userData.email - Email único
   * @param {string} userData.password - Contraseña en texto plano
   * @param {string} userData.rol - Rol del usuario ('client' o 'admin')
   * @returns {Promise<Object>} Usuario creado sin contraseña
   */
  static async create({
    nombre, email, password, rol = 'client',
  }) {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)';

      db.run(sql, [nombre, email, hashedPassword, rol], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('El email ya está registrado'));
          } else {
            reject(err);
          }
        } else {
          resolve({
            id: this.lastID,
            nombre,
            email,
            rol,
          });
        }
      });
    });
  }

  /**
   * Busca un usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT * FROM users WHERE email = ?';

      db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Busca un usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT id, nombre, email, rol, created_at FROM users WHERE id = ?';

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado
   * @param {string} plainPassword - Contraseña en texto plano
   * @param {string} hashedPassword - Hash de la contraseña
   * @returns {Promise<boolean>} True si coincide, false si no
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Obtiene todos los usuarios (sin contraseñas)
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT id, nombre, email, rol, created_at FROM users';

      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = User;
