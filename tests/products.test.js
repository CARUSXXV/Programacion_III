const request = require('supertest');
const app = require('../src/app');
const { initDatabase, closeDatabase, getDatabase } = require('../src/config/database');
const User = require('../src/models/User');
const { generateToken } = require('../src/utils/jwtUtils');

describe('Product Endpoints', () => {
  let adminToken;
  let clientToken;

  beforeAll(async () => {
    process.env.DB_PATH = ':memory:';
    await initDatabase();

    // Crear un admin y un cliente para los tests
    const admin = await User.create({
      nombre: 'Admin User',
      email: 'admin@test.com',
      password: 'Password123',
      rol: 'admin',
    });

    const client = await User.create({
      nombre: 'Client User',
      email: 'client@test.com',
      password: 'Password123',
      rol: 'client',
    });

    adminToken = generateToken({ id: admin.id, email: admin.email, rol: admin.rol });
    clientToken = generateToken({ id: client.id, email: client.email, rol: client.rol });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/products', () => {
    it('should allow admin to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Super Mario Bros',
          codigo: 'NES001',
          precio: 49.99,
          descripcion: 'Clásico de NES',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nombre).toBe('Super Mario Bros');
    });

    it('should not allow client to create a product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          nombre: 'Sonic the Hedgehog',
          codigo: 'GEN001',
          precio: 39.99,
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('should validate that price is greater than 0', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Invalid Product',
          codigo: 'INV001',
          precio: -10,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should allow authenticated users to see all products', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not allow unauthenticated users to see products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/products/:codigo', () => {
    it('should return a product by its code', async () => {
      const res = await request(app)
        .get('/api/products/NES001')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data.codigo).toBe('NES001');
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/NONEXISTENT')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });
});
