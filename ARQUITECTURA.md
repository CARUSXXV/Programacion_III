# Arquitectura del Sistema RetroVault - Evaluación 1

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
├── tests/
│   └── auth.test.js              # Tests de autenticación
├── database/
│   └── retrovault.db             # Base de datos SQLite
├── .env.example                  # Plantilla de variables de entorno
├── .eslintrc.json                # Configuración ESLint
├── package.json
├── server.js                     # Punto de entrada
└── README.md
```

## Modelo de Datos

### Tabla: users

| Campo        | Tipo    | Descripción                           |
|-------------|---------|---------------------------------------|
| id          | INTEGER | Primary Key, autoincremental          |
| nombre      | TEXT    | Nombre completo del usuario           |
| email       | TEXT    | Email único (usado para login)        |
| password    | TEXT    | Contraseña encriptada con bcrypt      |
| rol         | TEXT    | 'client' o 'admin'                    |
| created_at  | TEXT    | Fecha de creación (ISO 8601)          |

## Endpoints de la API

### 1. POST /api/auth/register
**Descripción:** Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "rol": "client"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "client"
  }
}
```

### 2. POST /api/auth/login
**Descripción:** Autentica un usuario y devuelve un token JWT.

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "client"
    }
  }
}
```

### 3. GET /api/auth/perfil
**Descripción:** Obtiene la información del usuario autenticado (endpoint protegido).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "client",
    "created_at": "2026-01-25T17:30:00.000Z"
  }
}
```

## Seguridad

- **Encriptación de contraseñas:** bcrypt con salt rounds = 10
- **JWT:** Token con expiración de 24 horas
- **Validación:** Express-validator para validar entradas
- **Variables de entorno:** Secretos almacenados en .env

## Stack Tecnológico

- **Runtime:** Node.js
- **Framework:** Express.js
- **Base de datos:** SQLite3
- **Autenticación:** JWT (jsonwebtoken)
- **Encriptación:** bcrypt
- **Testing:** Jest + Supertest
- **Linting:** ESLint (Airbnb style guide)
- **Validación:** express-validator

## Roles del Sistema

1. **client:** Usuario comprador con acceso a catálogo y carrito (futuro)
2. **admin:** Usuario administrador con permisos para gestionar productos (futuro)
