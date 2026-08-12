process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Product = require('../../models/product');
const Menu = require('../../models/menu');
const Order = require('../../models/order');
const { STATUS } = require('../../config/statuts');

let mockCurrentRole = 'administrateur';


// on fait unn moke pour simuler la connexion : 
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      userId: '6a58e381df483c9e75bdbb2d', // on met n'importe quel id
      role: mockCurrentRole
    };
    next();
  };
})

const app = require("../../index");


let mongoServer;
let orderId;

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
 await Product.create({
    _id: '6a6b442e279ded257bfe5c99',
    nom: 'Produit test',
    prix: 5.40,
    categorie: 'burgers',
    disponible: true,
    image: 'tests/imagesTest/BIGMAC.png'
  });
  await Menu.create({
    _id: '7a6b442e279ded257bfe5c90',
    nom: 'Menu test',
    prix: 11.00,
    categorie: 'burgers',
    disponible: true,
    options : {
      taille: 'Menu Best Of',
      accompagnement: 'Frites',
      boisson: 'Eau',
      sauce: 'chinoise'
    },
    imageBurger: 'tests/imagesTest/BIGMAC.png'
  });
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


// Statut de brouillon à en_attente
describe('PATCH /orders/status/:id', () => {

beforeEach(async () => {
  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 2,
        totalArticle: 10.8
      }
    ],
    status: 'brouillon'
  });

  orderId = order._id.toString();
});

// ADMINISTRATEUR
  it('Un administrateur peut passer une commande de brouillon à en_attente', async() => {
    mockCurrentRole = 'administrateur';

  // Modification de la commande
  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
          status: 'en_attente',
    });
  
  console.log(orderResponse.body);

  // on s'attend à ce que le statuts de la réponse soit : 
  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('en_attente');
  });

// ACCUEIL
  it('Un accueil peut passer une commande de brouillon à en_attente', async () => {
  mockCurrentRole = 'accueil';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'en_attente',
    });

  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('en_attente');
  });

// PREPARATEUR
  it('Un preparateur ne peut pas passer une commande de brouillon à en_attente', async () => {
  mockCurrentRole = 'preparateur';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'en_attente',
    });

  expect(orderResponse.statusCode).toBe(403);
  });
});


// Statut de en_attente à preparee
describe('PATCH /orders/status/:id', () => {

beforeEach(async () => {
  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 2,
        totalArticle: 10.8
      }
    ],
    status: 'en_attente'
  });

  orderId = order._id.toString();
});

// ADMINISTRATEUR
  it('Un administrateur peut passer une commande de en_attente à preparee', async() => {
    mockCurrentRole = 'administrateur';

  // Modification de la commande
  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
          status: 'preparee',
    });
  
  console.log(orderResponse.body);

  // on s'attend à ce que le statuts de la réponse soit : 
  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('preparee');
  });

// ACCUEIL
  it('Un accueil ne peut pas passer une commande de en_attente à preparee', async () => {
  mockCurrentRole = 'accueil';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'preparee',
    });

  expect(orderResponse.statusCode).toBe(403);
  });

// PREPARATEUR
  it('Un preparateur peut passer une commande de en_attente à preparee', async () => {
  mockCurrentRole = 'preparateur';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'preparee',
    });

  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('preparee');
  });
});

// Statut de preparee à livree 
describe('PATCH /orders/status/:id', () => {

beforeEach(async () => {
  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 2,
        totalArticle: 10.8
      }
    ],
    status: 'preparee'
  });

  orderId = order._id.toString();
});

// ADMINISTRATEUR
  it('Un administrateur peut passer une commande de preparee à livree', async() => {
    mockCurrentRole = 'administrateur';

  // Modification de la commande
  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
          status: 'livree',
    });
  
  console.log(orderResponse.body);

  // on s'attend à ce que le statuts de la réponse soit : 
  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('livree');
  });

// ACCUEIL
  it('Un accueil peut passer une commande de preparee à livree', async () => {
  mockCurrentRole = 'accueil';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'livree',
    });

  expect(orderResponse.statusCode).toBe(200);

  // on vérifie la commande :
  // article 1 : produit 
  expect(orderResponse.body.status).toBe('livree');
  });

// PREPARATEUR
  it('Un preparateur ne peut pas passer une commande de preparee à livree', async () => {
  mockCurrentRole = 'preparateur';

  const orderResponse = await request(app)
    .patch(`/api/orders/status/${orderId}`)
    .set('Authorization', 'Bearer token')
    .send({
      status: 'livree',
    });

  expect(orderResponse.statusCode).toBe(403);
  });
});

// Le client n'a aucun droit, on test pour un changement
describe('PATCH /orders/status/:id', () => {
  
beforeEach(async () => {
  const order = await Order.create({
    articles: [
      {
        type: 'Product',
        id_element: '6a6b442e279ded257bfe5c99',
        quantite: 2,
        totalArticle: 10.8
      }
    ],
    status: 'brouillon'
  });

  orderId = order._id.toString();
});
  // CLIENT
  it('Un client ne peut pas modifier le statut d\'une commande', async() => {
    mockCurrentRole = 'client';

  const orderResponse = await request(app) 
  .patch(`/api/orders/status/${orderId}`)
  .set('Authorization', 'Bearer token')
  .send({
      status: 'en_attente'
  });

  console.log('Réponse :', orderResponse.body);

  expect(orderResponse.statusCode).toBe(403);
  
  });
});