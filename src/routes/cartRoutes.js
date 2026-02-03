const express = require('express');

const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middlewares/authMiddleware');

// Todas las rutas del carrito requieren autenticación
router.use(authenticate);

/**
 * @route POST /api/cart
 * @desc Agregar producto al carrito
 */
router.post('/', cartController.addToCart);

/**
 * @route GET /api/cart
 * @desc Ver contenido del carrito y total
 */
router.get('/', cartController.getCart);

/**
 * @route DELETE /api/cart
 * @desc Vaciar el carrito
 */
router.delete('/', cartController.clearCart);

module.exports = router;
