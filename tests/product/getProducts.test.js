process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mockCurrentRole = 'administrateur';

jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      userId: '6a58e381df483c9e75bdbb2d',
      role: mockCurrentRole
    };
    next();
  };
});

const app = require('../../index');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /products', () => {
  let productId;

  beforeAll(async () => {
    mockCurrentRole = 'administrateur';

    await request(app)
      .post('/api/products')
      .field('nom', 'Mon Burger')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    await request(app)
      .post('/api/products')
      .field('nom', 'Mes Frites')
      .field('prix', '3.5')
      .field('categorie', 'frites')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/GRANDE_FRITE.png')
      .set('Authorization', 'Bearer token');

    await request(app)
      .post('/api/products')
      .field('nom', 'Mon Coca')
      .field('prix', '2.5')
      .field('categorie', 'boissons')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/coca-cola.png')
      .set('Authorization', 'Bearer token');
  });

  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => {
    it(`Un ${role} peut afficher la liste des produits`, async () => {
      mockCurrentRole = role;

      const productResponse = await request(app).get('/api/products/').set('Authorization', 'Bearer token');

      console.log(productResponse.body);

      expect(productResponse.statusCode).toBe(200);
      expect(productResponse.body.products).toHaveLength(3);

      expect(productResponse.body.products[0].nom).toBe('Mon Burger');
      expect(productResponse.body.products[0].prix).toBe(8.8);
      expect(productResponse.body.products[0].categorie).toBe('burgers');
      expect(productResponse.body.products[0].disponible).toBe(true);

      expect(productResponse.body.products[1].nom).toBe('Mes Frites');
      expect(productResponse.body.products[1].prix).toBe(3.5);
      expect(productResponse.body.products[1].categorie).toBe('frites');
      expect(productResponse.body.products[1].disponible).toBe(true);

      expect(productResponse.body.products[2].nom).toBe('Mon Coca');
      expect(productResponse.body.products[2].prix).toBe(2.5);
      expect(productResponse.body.products[2].categorie).toBe('boissons');
      expect(productResponse.body.products[2].disponible).toBe(true);
    });
  });
});
