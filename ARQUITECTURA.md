# Arquitectura del Sistema RetroVault - Evaluación 5 (Pagos)

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
│   ├── utils/
│   │   └── jwtUtils.js           # Utilidades JWT
│   └── app.js                    # Configuración Express
├── public/                       # Frontend (HTML/JS/CSS)
│   ├── components/               # Componentes reutilizables (Modales, Navbar)
│   └── js/                       # Lógica del cliente (CartManager, etc.)
├── tests/
│   ├── auth.test.js              # Tests de autenticación
│   └── products.test.js          # Tests de productos
├── database/
│   └── retrovault.db             # Base de datos SQLite
├── server.js                     # Punto de entrada
└── README.md
```

## Modelo de Datos

### Tabla: products
| Campo       | Tipo    | Descripción                  |
|------------|---------|------------------------------|
| id         | INTEGER | Primary Key                  |
| nombre     | TEXT    | Nombre del producto          |
| codigo     | TEXT    | Código único alfanumérico    |
| precio     | REAL    | Precio (debe ser > 0)        |
| descripcion| TEXT    | Descripción del producto     |

### Tabla: cart_items
| Campo      | Tipo    | Descripción                  |
|------------|---------|------------------------------|
| id         | INTEGER | Primary Key                  |
| user_id    | INTEGER | FK -> users.id               |
| product_id | INTEGER | FK -> products.id            |
| cantidad   | INTEGER | Cantidad seleccionada        |

## Endpoints de la API (Nuevos)

### Productos
- `GET /api/products`: Listar todos los productos.
- `GET /api/products/:codigo`: Obtener producto por código.
- `POST /api/products`: Crear producto (Solo Admin).

### Carrito
- `GET /api/cart`: Ver carrito y total calculado.
- `POST /api/cart`: Añadir producto al carrito.
- `DELETE /api/cart`: Vaciar carrito.

## Flujo de Pago (Simulacro)
El sistema implementa un simulacro de pasarela de pagos en el frontend (`js/cart.js`):
1. El usuario inicia el checkout desde el carrito.
2. Se muestra un formulario de pago simulado.
3. Se emula un delay de procesamiento de 2 segundos.
4. Al confirmarse, se vacía el carrito en la base de datos y se muestra confirmación de éxito.

## Seguridad
- **Autenticación:** JWT para todas las rutas protegidas.
- **Autorización:** Middleware de roles para restringir acciones de administrador.
- **Validación:** `express-validator` asegura que los precios sean positivos y los campos obligatorios estén presentes.
