# Arquitectura del Sistema RetroVault - Evaluación 2 (Usuarios)

## Estructura del Proyecto
```
Programacion_III/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de SQLite
│   ├── models/
│   │   └── User.js               # Modelo de Usuario
│   ├── controllers/
│   │   └── authController.js     # Lógica de autenticación
│   ├── middlewares/
│   │   ├── authMiddleware.js     # Verificación de JWT
│   │   └── validationMiddleware.js # Validación de datos
│   ├── routes/
│   │   └── authRoutes.js         # Rutas de autenticación
│   ├── utils/
│   │   └── jwtUtils.js           # Utilidades JWT
│   └── app.js                    # Configuración Express
├── database/
│   └── retrovault.db             # Base de datos SQLite
└── server.js                     # Punto de entrada
```

## Modelo de Datos (Usuarios)

### Tabla: users
| Campo        | Tipo    | Descripción                           |
|-------------|---------|---------------------------------------|
| id          | INTEGER | Primary Key, autoincremental          |
| nombre      | TEXT    | Nombre completo del usuario           |
| email       | TEXT    | Email único (usado para login)        |
| password    | TEXT    | Contraseña encriptada con bcrypt      |
| rol         | TEXT    | 'client' o 'admin'                    |
| created_at  | TEXT    | Fecha de creación (ISO 8601)          |

## Endpoints de Autenticación
- `POST /api/auth/register`: Registro de nuevos usuarios con validación de email y contraseña.
- `POST /api/auth/login`: Autenticación y generación de token JWT.
- `GET /api/auth/perfil`: Obtención de datos del usuario autenticado.

## Seguridad
- Encriptación de contraseñas con `bcrypt`.
- Autenticación basada en tokens `JWT`.
- Validaciones de entrada con `express-validator`.
