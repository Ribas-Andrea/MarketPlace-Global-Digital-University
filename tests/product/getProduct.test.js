process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");


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

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /products/:id', () => {
 let productId;

  beforeAll(async () => {
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

  });

  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => { 
    it(`Un ${role} peut afficher un produit`, async () => { 
      mockCurrentRole = role;

      // Récupération du produit
      const response = await request(app)
      .get('/api/products/' + productId)
      .set('Authorization', 'Bearer token');

      console.log(response.body);

      // on vérifie la réponse : 
      expect(response.statusCode).toBe(200);
      expect(response.body.product.nom).toBe('Mon produit');
      expect(response.body.product.prix).toBe(8.8);
      expect(response.body.product.categorie).toBe('burgers');
      expect(response.body.product.disponible).toBe(true);
      expect(response.body.product.image).toBeDefined();
    });
  });
});

