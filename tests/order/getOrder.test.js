process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const Product = require('../../models/product');
const Menu = require('../../models/menu');
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
let orderId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
  await Product.create({
    _id: '6a6b442e279ded257bfe5c99',
    nom: 'Produit test',
    prix: 5.4,
    categorie: 'burgers',
    disponible: true,
    image: 'tests/imagesTest/BIGMAC.png'
  });
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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /orders/:id', () => {
  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => {
    it(`Un ${role} peut afficher une commande`, async () => {
      mockCurrentRole = role;

      const orderResponse = await request(app).get(`/api/orders/${orderId}`).set('Authorization', 'Bearer token');

      console.log(orderResponse.body);

      expect(orderResponse.statusCode).toBe(200);

      expect(orderResponse.body.order.articles).toHaveLength(2);

      expect(orderResponse.body.order.articles[0].type).toBe('Product');
      expect(orderResponse.body.order.articles[0].id_element).toBe('6a6b442e279ded257bfe5c99');
      expect(orderResponse.body.order.articles[0].quantite).toBe(2);
      expect(orderResponse.body.order.articles[0].totalArticle).toBe(10.8);

      expect(orderResponse.body.order.articles[1].type).toBe('Menu');
      expect(orderResponse.body.order.articles[1].id_element).toBe('7a6b442e279ded257bfe5c90');
      expect(orderResponse.body.order.articles[1].quantite).toBe(2);
      expect(orderResponse.body.order.articles[1].totalArticle).toBe(22);

      expect(orderResponse.body.order.status).toBe('brouillon');
    });
  });
});
