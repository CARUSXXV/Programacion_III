# Arquitectura del Sistema RetroVault - Evaluación 4 (Carrito)

## Estructura del Proyecto
```
Programacion_III/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de SQLite
│   ├── models/
│   │   ├── User.js               # Modelo de Usuario
│   │   ├── Product.js            # Modelo de Producto
│   │   └── Cart.js               # Modelo de Carrito
│   ├── controllers/
│   │   ├── authController.js     # Lógica de autenticación
│   │   ├── productController.js  # Lógica de productos
│   │   └── cartController.js     # Lógica de carrito
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Verificación de JWT y Roles
│   │   └── validationMiddleware.js # Validación de datos
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   ├── productRoutes.js      # Rutas de productos
│   │   └── cartRoutes.js         # Rutas de carrito
│   └── app.js                    # Configuración Express
├── database/
│   └── retrovault.db             # Base de datos SQLite
└── server.js                     # Punto de entrada
```

## Modelo de Datos (Carrito)

### Tabla: cart_items
| Campo      | Tipo    | Descripción                  |
|------------|---------|------------------------------|
| id         | INTEGER | Primary Key                  |
| user_id    | INTEGER | FK -> users.id               |
| product_id | INTEGER | FK -> products.id            |
| cantidad   | INTEGER | Cantidad seleccionada        |

## Endpoints del Carrito
- `GET /api/cart`: Obtiene los items del usuario actual y calcula el total sumando los subtotales (cantidad * precio).
- `POST /api/cart`: Agrega un producto al carrito. Si ya existe, incrementa la cantidad.
- `DELETE /api/cart`: Elimina todos los items del carrito del usuario autenticado.

## Seguridad
- Todas las rutas de carrito requieren un token JWT válido.
- El `user_id` se extrae directamente del token para asegurar que un usuario solo pueda ver/modificar su propio carrito.
