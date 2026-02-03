const { getDatabase } = require('../config/database');

class Cart {
  /**
   * Agrega un producto al carrito o incrementa su cantidad si ya existe
   * @param {number} userId - ID del usuario
   * @param {number} productId - ID del producto
   * @param {number} cantidad - Cantidad a agregar
   * @returns {Promise<Object>} Item del carrito creado o actualizado
   */
  static async addItem(userId, productId, cantidad = 1) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // Verificar si el producto ya está en el carrito para ese usuario
      const checkSql = 'SELECT id, cantidad FROM cart_items WHERE user_id = ? AND product_id = ?';
      
      db.get(checkSql, [userId, productId], (err, row) => {
        if (err) return reject(err);
        
        if (row) {
          // Si ya existe, actualizar cantidad
          const newCantidad = row.cantidad + cantidad;
          const updateSql = 'UPDATE cart_items SET cantidad = ? WHERE id = ?';
          db.run(updateSql, [newCantidad, row.id], function(err) {
            if (err) return reject(err);
            resolve({ id: row.id, userId, productId, cantidad: newCantidad });
          });
        } else {
          // Si no existe, insertar nuevo
          const insertSql = 'INSERT INTO cart_items (user_id, product_id, cantidad) VALUES (?, ?, ?)';
          db.run(insertSql, [userId, productId, cantidad], function(err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, userId, productId, cantidad });
          });
        }
      });
    });
  }

  /**
   * Obtiene todos los items del carrito de un usuario con información del producto
   * @param {number} userId - ID del usuario
   * @returns {Promise<Array>} Lista de items con detalles de producto
   */
  static async getByUser(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = `
        SELECT ci.id, ci.product_id, ci.cantidad, p.nombre, p.precio, p.codigo, (ci.cantidad * p.precio) as subtotal
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `;
      
      db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  /**
   * Vacía el carrito de un usuario
   * @param {number} userId - ID del usuario
   * @returns {Promise<void>}
   */
  static async clear(userId) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const sql = 'DELETE FROM cart_items WHERE user_id = ?';
      
      db.run(sql, [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = Cart;
