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

describe('DELETE /products/:id', () => {
  let productId;

  beforeEach(async () => {
    mockCurrentRole = 'administrateur';

    const productResponse = await request(app)
      .post('/api/products')
      .field('nom', 'Produit test')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log(productResponse.body);
    expect(productResponse.statusCode).toBe(201);

    productId = productResponse.body._id;
  });

  // ADMINISTRATEUR
  it('Un administrateur peut supprimer un produit', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).delete(`/api/products/${productId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(200);
  });

  // ACCUEIL
  it("Un membre de l'accueil ne peut pas supprimer un produit", async () => {
    mockCurrentRole = 'accueil';

    const response = await request(app).delete(`/api/products/${productId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas supprimer un produit', async () => {
    mockCurrentRole = 'preparateur';

    const response = await request(app).delete(`/api/products/${productId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas supprimer un produit', async () => {
    mockCurrentRole = 'client';

    const response = await request(app).delete(`/api/products/${productId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });
});
