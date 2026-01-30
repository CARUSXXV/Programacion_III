const request = require('supertest');
const app = require('../src/app');
const { initDatabase, closeDatabase } = require('../src/config/database');

// Configurar base de datos de prueba
process.env.DB_PATH = ':memory:';

describe('Sistema de Autenticación - RetroVault', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  afterEach(async () => {
    // Limpiar la base de datos después de cada test
    const { getDatabase } = require('../src/config/database');
    const db = getDatabase();
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('POST /api/auth/register', () => {
    it('Debe registrar un nuevo usuario correctamente', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          rol: 'client',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuario registrado exitosamente');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nombre).toBe('Juan Pérez');
      expect(response.body.data.email).toBe('juan@example.com');
      expect(response.body.data.rol).toBe('client');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('Debe rechazar registro con email duplicado', async () => {
      // Primero registrar un usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          rol: 'client',
        });

      // Intentar registrar otro usuario con el mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Pedro García',
          email: 'juan@example.com',
          password: 'Password456',
          rol: 'client',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('El email ya está registrado');
    });

    it('Debe rechazar registro con contraseña débil', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'María López',
          email: 'maria@example.com',
          password: 'weak',
          rol: 'client',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Errores de validación');
    });

    it('Debe rechazar registro sin email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Carlos Ruiz',
          password: 'Password123',
          rol: 'client',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('Debe registrar un nuevo usuario como client por defecto', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Usuario Normal',
          email: 'normal@retrovault.com',
          password: 'NormalPass123',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.rol).toBe('client');
    });
  });

  describe('POST /api/auth/login', () => {
    it('Debe autenticar usuario con credenciales válidas', async () => {
      // Primero registrar un usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123',
          rol: 'client',
        });

      // Luego hacer login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login exitoso');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('juan@example.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('Debe rechazar login con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('Debe rechazar login con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'juan@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    it('Debe rechazar login sin email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/perfil', () => {
    let authToken;

    beforeAll(async () => {
      // Primero registrar un usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          nombre: 'Usuario Test',
          email: 'test@example.com',
          password: 'Password123',
          rol: 'client',
        });

      // Luego hacer login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      authToken = loginResponse.body.data.token;
    });

    it('Debe obtener perfil con token válido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nombre');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('rol');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('Debe rechazar acceso sin token', async () => {
      const response = await request(app)
        .get('/api/auth/perfil');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Token no proporcionado. Acceso denegado.');
    });

    it('Debe rechazar acceso con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/perfil')
        .set('Authorization', 'Bearer token_invalido_123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api', () => {
    it('Debe mostrar información de bienvenida de la API', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('RetroVault');
    });
  });

  describe('Rutas no encontradas', () => {
    it('Debe retornar 404 para rutas de API inexistentes', async () => {
      const response = await request(app).get('/api/ruta/inexistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint de API no encontrado');
    });
  });
});
