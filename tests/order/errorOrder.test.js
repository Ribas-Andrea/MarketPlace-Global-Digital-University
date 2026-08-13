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
let productId;
let menuId;
let orderId;

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

  const menu = await Menu.create({
    _id: '7a6b442e279ded257bfe5c90',
    nom: 'Menu test',
    prix: 11,
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

  productId = product._id.toString();
  menuId = menu._id.toString();

  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: productId,
        quantite: 2,
        totalArticle: 10.8
      },
      {
        type: 'Menu',
        id_element: menuId,
        quantite: 2,
        totalArticle: 22
      }
    ]
  });

  orderId = order._id.toString();

  console.log('Product ID :', productId);
  console.log('Menu ID :', menuId);
  console.log('Order ID :', orderId);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tests des erreurs Order', () => {

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la récupération d'une commande.
  it('GET /orders/:id - ID invalide', async () => {
    const response = await request(app)
      .get('/api/orders/123')
      .set('Authorization', 'Bearer token');

    console.log('GET commande - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant renvoie une erreur 404.
  it('GET /orders/:id - commande inexistante', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/orders/${fakeId}`)
      .set('Authorization', 'Bearer token');

    console.log('GET commande - commande inexistante :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Commande non trouvée');
  });

  // Vérifie qu'un type d'article autre que Product ou Menu renvoie une erreur 400.
  it('POST /orders - type article invalide', async () => {
    mockCurrentRole = 'client';

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer token')
      .send({
        articles: [
          {
            type: 'Autre',
            id_element: productId,
            quantite: 1
          }
        ]
      });

    console.log('Création commande - type invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("Type d'article invalide");
  });

  // Vérifie qu'un article qui n'existe pas renvoie une erreur 404.
  it('POST /orders - article inexistant', async () => {
    mockCurrentRole = 'client';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .post('/api/orders')
      .set('Authorization', 'Bearer token')
      .send({
        articles: [
          {
            type: 'Product',
            id_element: fakeId,
            quantite: 1
          }
        ]
      });

    console.log('Création commande - article inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Article non trouvé');
  });

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la modification d'une commande.
  it('PUT /orders/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .put('/api/orders/123')
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: productId,
        quantite: 3
      });

    console.log('Modification commande - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'une commande inexistante renvoie une erreur 404 lors de la modification.
  it('PUT /orders/:id - commande inexistante', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/orders/${fakeId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: productId,
        quantite: 3
      });

    console.log('Modification commande - commande inexistante :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Commande non trouvé');
  });

  // Vérifie qu'un article qui n'est pas présent dans la commande renvoie une erreur 404.
  it('PUT /orders/:id - article absent de la commande', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
        type: 'Product',
        id_element: new mongoose.Types.ObjectId().toString(),
        quantite: 3
      });

    console.log('Modification commande - article absent :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Article non trouvé dans la commande');
  });

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la suppression d'une commande.
  it('DELETE /orders/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .delete('/api/orders/123')
      .set('Authorization', 'Bearer token');

    console.log('Suppression commande - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'une commande inexistante renvoie une erreur 404 lors de sa suppression.
  it('DELETE /orders/:id - commande inexistante', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/orders/${fakeId}`)
      .set('Authorization', 'Bearer token');

    console.log('Suppression commande - commande inexistante :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Commande non trouvée');
  });
});