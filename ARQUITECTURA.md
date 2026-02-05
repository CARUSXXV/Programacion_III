# Arquitectura del Sistema RetroVault - Evaluación 3 (Productos)

## Estructura del Proyecto
```
Programacion_III/
├── src/
│   ├── models/
│   │   ├── User.js               # Modelo de Usuario
│   │   └── Product.js            # Modelo de Producto
│   ├── controllers/
│   │   ├── authController.js     # Lógica de autenticación
│   │   └── productController.js  # Lógica de productos
│   ├── routes/
│   │   ├── authRoutes.js         # Rutas de autenticación
│   │   └── productRoutes.js      # Rutas de productos
│   └── app.js                    # Configuración Express
└── server.js                     # Punto de entrada
```

## Modelo de Datos (Productos)

### Tabla: products
| Campo       | Tipo    | Descripción                  |
|------------|---------|------------------------------|
| id         | INTEGER | Primary Key                  |
| nombre     | TEXT    | Nombre del producto          |
| codigo     | TEXT    | Código único alfanumérico    |
| precio     | REAL    | Precio (Validado > 0)        |
| descripcion| TEXT    | Descripción del producto     |

## Endpoints de Productos
- `GET /api/products`: Retorna la lista completa de productos.
- `GET /api/products/:codigo`: Busca un producto específico por su código único.
- `POST /api/products`: Permite la creación de nuevos productos.

## Seguridad y Validación
- **Protección:** Todas las rutas requieren autenticación JWT.
- **Roles:** Solo usuarios con rol 'admin' pueden ejecutar el `POST` para crear productos.
- **Validación:** Se utiliza `express-validator` para asegurar que el precio sea un número mayor a cero.
