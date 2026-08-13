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

// Crée une commande avec le statut demandé pour chaque test.
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

  // Crée le produit utilisé par les commandes de test.
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

  // Vérifie qu'un administrateur peut faire passer une commande de brouillon à en_attente.
  it('Administrateur : brouillon → en_attente', async () => {
    mockCurrentRole = 'administrateur';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'en_attente'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('en_attente');
  });

  // Vérifie qu'un administrateur peut faire passer une commande de en_attente à preparee.
  it('Administrateur : en_attente → preparee', async () => {
    mockCurrentRole = 'administrateur';

    const orderId = await createTestOrder('en_attente');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'preparee'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('preparee');
  });

  // Vérifie qu'un accueil peut faire passer une commande de brouillon à en_attente.
  it('Accueil : brouillon → en_attente', async () => {
    mockCurrentRole = 'accueil';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'en_attente'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('en_attente');
  });

  // Vérifie qu'un accueil peut faire passer une commande préparée à livree.
  it('Accueil : preparee → livree', async () => {
    mockCurrentRole = 'accueil';

    const orderId = await createTestOrder('preparee');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'livree'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('livree');
  });

  // Vérifie qu'un préparateur peut faire passer une commande en attente à preparee.
  it('Préparateur : en_attente → preparee', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('en_attente');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'preparee'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('preparee');
  });

  // Vérifie qu'un préparateur ne peut pas faire passer une commande brouillon à en_attente.
  it('Préparateur : brouillon → en_attente interdite', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'en_attente'
      });

    expect(response.statusCode).toBe(403);
  });

  // Vérifie qu'un préparateur ne peut pas faire passer une commande preparee à livree.
  it('Préparateur : preparee → livree interdite', async () => {
    mockCurrentRole = 'preparateur';

    const orderId = await createTestOrder('preparee');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'livree'
      });

    expect(response.statusCode).toBe(403);
  });

  // Vérifie qu'un client ne peut pas modifier le statut d'une commande.
  it('Client : modification du statut interdite', async () => {
    mockCurrentRole = 'client';

    const orderId = await createTestOrder('brouillon');

    const response = await request(app)
      .patch(`/api/orders/status/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        status: 'en_attente'
      });

    expect(response.statusCode).toBe(403);
  });
});