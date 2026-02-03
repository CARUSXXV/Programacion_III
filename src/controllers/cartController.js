const Cart = require('../models/Cart');
const Product = require('../models/Product');

/**
 * Controlador para gestionar el carrito de compras
 */
const cartController = {
  /**
   * Agrega un producto al carrito
   */
  addToCart: async (req, res) => {
    try {
      const { productId, cantidad } = req.body;
      const userId = req.user.id; // Asumiendo que el middleware de auth pone el user en req

      if (!productId) {
        return res.status(400).json({ message: 'El ID del producto es requerido' });
      }

      // Verificar que el producto existe
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const item = await Cart.addItem(userId, productId, cantidad || 1);
      
      res.status(201).json({
        message: 'Producto agregado al carrito correctamente',
        item
      });
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * Obtiene el contenido del carrito y calcula el total
   */
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const items = await Cart.getByUser(userId);
      
      const total = items.reduce((acc, item) => acc + item.subtotal, 0);

      res.json({
        items,
        total: parseFloat(total.toFixed(2))
      });
    } catch (error) {
      console.error('Error al obtener el carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  },

  /**
   * Vacía el carrito del usuario
   */
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      await Cart.clear(userId);
      
      res.json({ message: 'Carrito vaciado correctamente' });
    } catch (error) {
      console.error('Error al vaciar el carrito:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
};

module.exports = cartController;
