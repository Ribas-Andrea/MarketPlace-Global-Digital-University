process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mockCurrentRole = 'administrateur';
let productId;

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

  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'test'
  });

  mockCurrentRole = 'administrateur';

  const productResponse = await request(app)
    .post('/api/products')
    .field('nom', 'Mon produit')
    .field('prix', '8.8')
    .field('categorie', 'burgers')
    .field('disponible', 'true')
    .attach('image', 'tests/imagesTest/BIGMAC.png')
    .set('Authorization', 'Bearer token');

  expect(productResponse.statusCode).toBe(201);

  productId = productResponse.body._id;

  console.log('Product ID utilisé pour les tests :', productId);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PUT /products/:id', () => {
  // ADMIN
  it('Un administrateur peut modifier un produit', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put(`/api/products/${productId}`).field('disponible', 'false').set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(200);

    expect(response.body.nom).toBe('Mon produit');
    expect(response.body.prix).toBe(8.8);
    expect(response.body.categorie).toBe('burgers');
    expect(response.body.disponible).toBe(false);
    expect(response.body.image).toBeDefined();
  });

  // ACCUEIL
  it('Un membre de l’accueil ne peut pas modifier un produit', async () => {
    mockCurrentRole = 'accueil';

    const response = await request(app).put(`/api/products/${productId}`).field('disponible', 'true').set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas modifier un produit', async () => {
    mockCurrentRole = 'preparateur';

    const response = await request(app).put(`/api/products/${productId}`).field('disponible', 'true').set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas modifier un produit', async () => {
    mockCurrentRole = 'client';

    const response = await request(app).put(`/api/products/${productId}`).field('disponible', 'true').set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });
});
