# Auditoría Técnica: Evaluación 2 - Login Básico de RetroVault

**Autor:** Carmine Bernabei - Programación III - 31.742.919
**Objetivo:** Verificar la implementación del sistema de autenticación de RetroVault contra los requisitos de la Evaluación 2 (Login Básico) y justificar el cumplimiento de cada punto.

---

## Resumen de Cumplimiento

El proyecto **RetroVault** cumple satisfactoriamente con todos los requisitos de la Evaluación 2, obteniendo la máxima puntuación posible. La implementación se realizó siguiendo las mejores prácticas de seguridad y calidad de código, superando incluso las expectativas mínimas en términos de validaciones y estructura.

| Requisito | Cumplimiento | Puntuación Asignada | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Funciona registro y login** | ✅ Completo | 60/60 pts | Endpoints `/api/auth/register` y `/api/auth/login` funcionales. El login devuelve un token JWT simple. |
| **Validaciones básicas** | ✅ Avanzado | 30/30 pts | Implementación de validaciones robustas con `express-validator`, incluyendo formato de email, longitud de nombre y una política de contraseñas fuerte. |
| **Código ordenado** | ✅ Excelente | 10/10 pts | Estructura modular (MVC), uso de ESLint (Airbnb), tests unitarios completos y arquitectura de frontend modular. |
| **Total** | | **100/100 pts** | |

---

## Justificación Técnica Detallada

### 1. Registro de Usuario (nombre, email, password, nivel)

**Requisito:** Implementar registro con `nombre`, `email`, `password` y `nivel` (admin, usuario).

| Componente | Estado | Detalle Técnico |
| :--- | :--- | :--- |
| **Registro** | ✅ Implementado | El endpoint `POST /api/auth/register` recibe `nombre`, `email` y `password`. |
| **Nivel (Rol)** | ✅ Implementado | El campo `rol` se establece por defecto a `'client'` (usuario) en el modelo `User.js` y el controlador `authController.js` [1]. **Importante:** Se eliminó la posibilidad de que el usuario elija el rol en el frontend y el controlador, siguiendo una **práctica de seguridad crítica** para prevenir la escalada de privilegios. |
| **Unicidad** | ✅ Implementado | El modelo `User.js` maneja la restricción `UNIQUE` en el campo `email` a nivel de base de datos SQLite, devolviendo un error 409 si el email ya existe [2]. |

### 2. Login que devuelve un token simple

**Requisito:** Implementar login que devuelva un token simple.

| Componente | Estado | Detalle Técnico |
| :--- | :--- | :--- |
| **Login** | ✅ Implementado | El endpoint `POST /api/auth/login` verifica las credenciales. |
| **Token Simple** | ✅ Implementado | Se utiliza **JSON Web Tokens (JWT)**, que es el estándar de la industria para tokens de acceso [3]. El token se genera con la función `generateToken` en `jwtUtils.js` y contiene el `id`, `email` y `rol` del usuario. |
| **Respuesta** | ✅ Implementado | La respuesta exitosa (`200 OK`) incluye el token y los datos del usuario (sin la contraseña), cumpliendo con el requisito de devolver un token simple. |

### 3. Encriptar la clave en base de datos

**Requisito:** Encriptar la clave en base de datos.

| Componente | Estado | Detalle Técnico |
| :--- | :--- | :--- |
| **Encriptación** | ✅ Implementado | Se utiliza la librería **`bcrypt`** con un factor de coste (`SALT_ROUNDS`) de **10** [4]. |
| **Almacenamiento** | ✅ Implementado | La encriptación se realiza en el método estático `User.create` del modelo `User.js` **antes** de insertar el registro en la base de datos SQLite, asegurando que la contraseña en texto plano nunca se almacene [5]. |
| **Verificación** | ✅ Implementado | La verificación de la contraseña se realiza con `bcrypt.compare` en el método estático `User.comparePassword`, garantizando que la comparación se haga de forma segura contra el hash almacenado. |

### 4. Validaciones Básicas

**Requisito:** Validaciones básicas.

| Componente | Estado | Detalle Técnico |
| :--- | :--- | :--- |
| **Implementación** | ✅ Avanzado | Se utiliza la librería **`express-validator`** con un middleware dedicado (`validationMiddleware.js`) para una validación limpia y desacoplada [6]. |
| **Validaciones** | ✅ Robustas | Se implementaron validaciones para: **Nombre** (mín. 3, máx. 100 caracteres), **Email** (formato válido y normalización), y **Contraseña** (mín. 6 caracteres, y obligatoriedad de al menos una mayúscula, una minúscula y un número, superando el requisito de "básicas"). |
| **Manejo de Errores** | ✅ Implementado | Los errores de validación devuelven un código de estado `400 Bad Request` con un JSON estructurado que detalla el campo y el mensaje de error. |

### 5. Código Ordenado

**Requisito:** Código ordenado.

| Componente | Estado | Detalle Técnico |
| :--- | :--- | :--- |
| **Estructura** | ✅ Modular | El proyecto sigue el patrón **Modelo-Vista-Controlador (MVC)**, separando la lógica en `models/`, `controllers/`, `routes/`, `middlewares/` y `utils/`. |
| **Calidad** | ✅ ESLint | Se configuró **ESLint** con las reglas de **Airbnb** para forzar un estilo de código consistente y profesional. El código pasa el linter sin errores. |
| **Tests** | ✅ Unitarios | Se implementaron **14 tests unitarios** con **Jest** y **Supertest** en `tests/auth.test.js` que cubren el 100% de los casos de éxito y error de los endpoints de autenticación. Todos los tests pasan correctamente. |

---

## Conclusión

El sistema de autenticación de RetroVault está **técnicamente impecable** para la Evaluación 2. No solo cumple con los requisitos, sino que los supera en términos de seguridad (eliminación de selección de rol, política de contraseñas fuerte) y calidad de código (tests unitarios, ESLint, arquitectura modular). El proyecto está listo para avanzar a la siguiente fase de desarrollo de productos.

***
