process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../../models/product');
const Menu = require('../../models/menu');
const Order = require('../../models/order');

let mockCurrentRole = 'administrateur';
let orderId;

// On fait un mock pour simuler la connexion :
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

  // Création du produit
  await Product.create({
    _id: '6a6b442e279ded257bfe5c99',
    nom: 'Produit test',
    prix: 5.4,
    categorie: 'burgers',
    disponible: true,
    image: 'tests/imagesTest/BIGMAC.png'
  });

  // Création du menu
  await Menu.create({
    _id: '7a6b442e279ded257bfe5c90',
    nom: 'Menu test',
    prix: 11.0,
    categorie: 'burgers',
    disponible: true,
    options: {
      taille: 'Menu Best Of',
      accompagnement: 'Frites',
      boisson: 'Eau',
      sauce: 'chinoise'
    },
    imageBurger: 'tests/imagesTest/BIGMAC.png'
  });

  // Création de la commande
  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 2,
        totalArticle: 10.8
      },
      {
        type: 'Menu',
        id_element: '7a6b442e279ded257bfe5c90',
        quantite: 2,
        totalArticle: 22
      }
    ]
  });

  orderId = order._id.toString();

  console.log('Order ID utilisé pour les tests :', orderId);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PUT /orders/:id', () => {

  // ADMINISTRATEUR
  it('Un administrateur peut modifier une commande', async () => {
    mockCurrentRole = 'administrateur';

    const orderResponse = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 3
      });

    console.log('Réponse administrateur :', orderResponse.body);

    expect(orderResponse.statusCode).toBe(200);

    expect(orderResponse.body.articles[0].type).toBe('Product');
    expect(orderResponse.body.articles[0].id_element).toBe(
      '6a6b442e279ded257bfe5c99'
    );
    expect(orderResponse.body.articles[0].quantite).toBe(3);
    expect(orderResponse.body.articles[0].totalArticle).toBe(10.8);
  });

  // ACCUEIL
  it('Un accueil peut modifier une commande', async () => {
    mockCurrentRole = 'accueil';

    const orderResponse = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 3
      });

    console.log('Réponse accueil :', orderResponse.body);

    expect(orderResponse.statusCode).toBe(200);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas modifier une commande', async () => {
    mockCurrentRole = 'preparateur';

    const orderResponse = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 3
      });

    console.log('Réponse préparateur :', orderResponse.body);

    expect(orderResponse.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client peut modifier une commande', async () => {
    mockCurrentRole = 'client';

    const orderResponse = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 3
      });

    console.log('Réponse client :', orderResponse.body);

    expect(orderResponse.statusCode).toBe(200);
  });
});