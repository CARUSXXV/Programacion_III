const { getDatabase } = require('../config/database');

class Product {
  /**
   * Crea un nuevo producto en la base de datos
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} Producto creado
   */
  static async create({
    nombre, codigo, precio, descripcion,
  }) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'INSERT INTO products (nombre, codigo, precio, descripcion) VALUES (?, ?, ?, ?)';

      db.run(sql, [nombre, codigo, precio, descripcion], function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            reject(new Error('El código del producto ya está registrado'));
          } else {
            reject(err);
          }
        } else {
          resolve({
            id: this.lastID,
            nombre,
            codigo,
            precio,
            descripcion,
          });
        }
      });
    });
  }

  /**
   * Obtiene todos los productos
   * @returns {Promise<Array>} Lista de productos
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT * FROM products ORDER BY created_at DESC';

      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Busca un producto por su código único
   * @param {string} codigo - Código del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  static async findByCodigo(codigo) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT * FROM products WHERE codigo = ?';

      db.get(sql, [codigo], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  /**
   * Busca un producto por su ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object|null>} Producto encontrado o null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'SELECT * FROM products WHERE id = ?';

      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }
}

module.exports = Product;
