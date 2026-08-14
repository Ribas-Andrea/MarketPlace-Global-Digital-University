process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../../models/product');
const Order = require('../../models/order');

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
let productId;

async function createTestOrder(status) {
  const order = await Order.create({
    status,
    articles: [
      {
        type: 'Product',
        id_element: productId,
        quantite: 1,
        totalArticle: 5.4
      }
    ]
  });

  return order._id.toString();
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'test'
  });

  const product = await Product.create({
    _id: '6a6b442e279ded257bfe5c99',
    nom: 'Produit test',
    prix: 5.4,
    categorie: 'burgers',
    disponible: true,
    image: 'tests/imagesTest/BIGMAC.png'
  });

  productId = product._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PATCH /orders/status/:id - gestion des statuts', () => {
  it('Administrateur : brouillon → en_attente', async () => {
    mockCurrentRole = 'administrateur';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'en_attente'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('en_attente');
  });

  it('Administrateur : en_attente → preparee', async () => {
    mockCurrentRole = 'administrateur';

    const orderId = await createTestOrder('en_attente');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'preparee'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('preparee');
  });

  it('Accueil : brouillon → en_attente', async () => {
    mockCurrentRole = 'accueil';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'en_attente'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('en_attente');
  });

  it('Accueil : preparee → livree', async () => {
    mockCurrentRole = 'accueil';

    const orderId = await createTestOrder('preparee');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'livree'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('livree');
  });

  it('Préparateur : en_attente → preparee', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('en_attente');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'preparee'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('preparee');
  });

  it('Préparateur : brouillon → en_attente interdite', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'en_attente'
    });

    expect(response.statusCode).toBe(403);
  });

  it('Préparateur : preparee → livree interdite', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('preparee');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'livree'
    });

    expect(response.statusCode).toBe(403);
  });

  it('Client : modification du statut interdite', async () => {
    mockCurrentRole = 'client';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app).patch(`/api/orders/status/${orderId}`).set('Authorization', 'Bearer token').send({
      status: 'en_attente'
    });

    expect(response.statusCode).toBe(403);
  });
});
