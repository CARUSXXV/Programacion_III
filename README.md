# RetroVault API - Sistema de E-commerce de Videojuegos Retro

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)

Bienvenido a **RetroVault**, un sistema de e-commerce especializado en el coleccionismo de videojuegos clásicos y nostalgia gamer. Este documento detalla la implementación de la **Evaluación 1: Sistema de Autenticación**.

## Contexto del Negocio

RetroVault es una tienda online para entusiastas de los videojuegos retro. El catálogo se divide en tres categorías principales:

- **Software:** Juegos físicos en cartucho o disco (NES, SNES, PS1, etc.).
- **Hardware:** Consolas originales y modificadas (GameBoy, Sega Genesis, etc.).
- **Coleccionables:** Manuales, guías de estrategia y revistas de época.

Este proyecto sienta las bases del sistema, enfocándose en la autenticación y gestión de usuarios.

## 1. Instalación y Configuración

Sigue estos pasos para poner en marcha el servidor en tu entorno local.

### Prerrequisitos

- **Node.js** (versión 18.x o superior)
- **npm** (o un gestor de paquetes compatible como yarn o pnpm)

### Pasos de Instalación

1.  **Clonar el repositorio:**

    ```bash
    git clone https://github.com/CARUSXXV/Programacion_III.git
    cd Programacion_III
    ```

2.  **Instalar dependencias:**

    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**

    Copia el archivo `.env.example` y renómbralo a `.env`.

    ```bash
    cp .env.example .env
    ```

    Abre el archivo `.env` y modifica las variables si es necesario. Es **crucial** cambiar `JWT_SECRET` por una clave segura en un entorno de producción.

    ```dotenv
    # Configuración del Servidor
    PORT=3000
    NODE_ENV=development

    # JWT Secret (¡Cambiar por una clave segura!)
    JWT_SECRET=tu_clave_secreta_super_segura_aqui

    # JWT Expiración
    JWT_EXPIRES_IN=24h

    # Base de Datos
    DB_PATH=./database/retrovault.db
    ```

## 2. Ejecución del Servidor

Una vez configurado, puedes iniciar el servidor en diferentes modos.

-   **Modo de desarrollo (con recarga automática):**

    ```bash
    npm run dev
    ```

-   **Modo de producción:**

    ```bash
    npm start
    ```

Al iniciar, el servidor creará automáticamente la base de datos SQLite en el directorio `database/` y las tablas necesarias.

## 3. Endpoints de la API

A continuación se detallan los endpoints implementados para el sistema de autenticación.

### 3.1. Registro de Usuarios

Registra un nuevo usuario en el sistema. Las contraseñas se encriptan automáticamente con `bcrypt`.

-   **Endpoint:** `POST /api/auth/register`
-   **Acceso:** Público

#### Ejemplo de Request Body

```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "rol": "client"
}
```

-   El campo `rol` es opcional y por defecto es `client`. Los valores permitidos son `client` y `admin`.
-   La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.

#### Ejemplo de Response (201 Created)

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

### 3.2. Login de Usuarios

Autentica a un usuario con su email y contraseña, devolviendo un token JWT para futuras solicitudes.

-   **Endpoint:** `POST /api/auth/login`
-   **Acceso:** Público

#### Ejemplo de Request Body

```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

#### Ejemplo de Response (200 OK)

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
      "rol": "client",
      "created_at": "2026-01-25T18:00:00.000Z"
    }
  }
}
```

### 3.3. Perfil de Usuario

Devuelve la información del usuario autenticado. Este es un endpoint protegido que requiere un token JWT válido.

-   **Endpoint:** `GET /api/auth/perfil`
-   **Acceso:** Privado (requiere autenticación)

#### Ejemplo de Request Header

Para acceder a este endpoint, debes incluir el token JWT en el header `Authorization`.

```
Authorization: Bearer <tu_token_jwt>
```

#### Ejemplo de Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "client",
    "created_at": "2026-01-25T18:00:00.000Z"
  }
}
```

## 4. Calidad de Código y Testing

El proyecto está configurado para garantizar un código limpio y funcional.

### Linter (ESLint)

Se utiliza **ESLint** con la configuración de estilo de **Airbnb** para mantener un código consistente y legible. Para verificar el código, ejecuta:

```bash
npm run lint
```

Para intentar corregir automáticamente los problemas:

```bash
npm run lint:fix
```

### Tests Unitarios (Jest y Supertest)

Se han implementado tests unitarios para los endpoints de autenticación usando **Jest** y **Supertest**. Los tests se ejecutan en una base de datos en memoria para no afectar los datos de desarrollo.

Para ejecutar los tests:

```bash
npm test
```

Esto también generará un reporte de cobertura en la carpeta `coverage/`.

## 5. Estructura del Proyecto

El proyecto sigue una arquitectura modular para facilitar el mantenimiento y la escalabilidad.

```
Programacion_III/
├── database/              # Almacena el archivo de la base de datos SQLite
├── src/
│   ├── config/            # Configuración (DB, etc.)
│   ├── controllers/       # Lógica de negocio de las rutas
│   ├── middlewares/       # Middlewares de Express (auth, validation)
│   ├── models/            # Modelos de datos (ej. User)
│   ├── routes/            # Definición de las rutas de la API
│   ├── utils/             # Funciones de utilidad (ej. JWT)
│   └── app.js             # Configuración principal de Express
├── tests/                 # Archivos de tests unitarios
├── .env                   # Variables de entorno (ignoradas por Git)
├── .env.example           # Plantilla de variables de entorno
├── .eslintrc.json         # Configuración de ESLint
├── .gitignore             # Archivos y carpetas ignorados por Git
├── package.json           # Dependencias y scripts del proyecto
├── README.md              # Esta documentación
└── server.js              # Punto de entrada de la aplicación
```

## Próximos Pasos

-   **Evaluación 2:** Implementación del CRUD de productos.
-   **Evaluación 3:** Desarrollo del carrito de compras y simulación de pagos.
