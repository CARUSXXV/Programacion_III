const Product = require('../models/Product');

/**
 * Controlador para crear un nuevo producto
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const {
      nombre, codigo, precio, descripcion, categoria,
    } = req.body;

    // Verificar si el código ya existe
    const existingProduct = await Product.findByCodigo(codigo);
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'El código del producto ya está registrado',
      });
    }

    // Crear producto
    const newProduct = await Product.create({
      nombre,
      codigo,
      precio,
      descripcion,
      categoria,
    });

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: newProduct,
    });
  } catch (error) {
    console.error('Error en createProduct:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message,
    });
  }
};

/**
 * Controlador para obtener todos los productos
 * @route GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.findAll({ category });
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
      error: error.message,
    });
  }
};

/**
 * Controlador para obtener un producto por su código
 * @route GET /api/products/:codigo
 */
const getProductByCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const product = await Product.findByCodigo(codigo);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error en getProductByCodigo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductByCodigo,
};
