const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validateProduct } = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * @route GET /api/products
 * @desc Obtener todos los productos
 * @access Privado (Cualquier usuario autenticado)
 */
router.get('/', authenticate, productController.getAllProducts);

/**
 * @route GET /api/products/:codigo
 * @desc Obtener un producto por su código
 * @access Privado (Cualquier usuario autenticado)
 */
router.get('/:codigo', authenticate, productController.getProductByCodigo);

/**
 * @route POST /api/products
 * @desc Crear un nuevo producto
 * @access Privado (Solo administradores)
 */
router.post('/', authenticate, authorize('admin'), validateProduct, productController.createProduct);

module.exports = router;
