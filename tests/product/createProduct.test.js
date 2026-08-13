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


describe('POST /products', () => {

  // ADMIN
  it('Un administrateur peut créer un produit', async() => {
    mockCurrentRole = 'administrateur';
    const productResponse = await request(app)
      .post('/api/products')
      .field('nom', 'Mon produit')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

      console.log(productResponse.body);

      // on s'attend à ce que le statuts de la réponse soit : 
      expect(productResponse.statusCode).toBe(201);
      // on vérifie le produit : 
      expect(productResponse.body.nom).toBe('Mon produit');
      expect(productResponse.body.prix).toBe(8.8);
      expect(productResponse.body.categorie).toBe('burgers');
      expect(productResponse.body.disponible).toBe(true);
      expect(productResponse.body.image).toBeDefined();
  });

  // ACCUEIL
  it('Un membre de l’accueil ne peut pas créer un produit', async() => {
    mockCurrentRole = 'accueil';

  const productResponse = await request(app) 
  .post('/api/products') 
  .set('Authorization', 'Bearer token'); 

  console.log(productResponse.body);

  expect(productResponse.statusCode).toBe(403);
  
  });
  // PREPARATEUR
  it('Un préparateur ne peut pas créer un produit', async() => {
    mockCurrentRole = 'preparateur';

  const productResponse = await request(app) 
  .post('/api/products') 
  .set('Authorization', 'Bearer token'); 

  console.log(productResponse.body);

  expect(productResponse.statusCode).toBe(403);
  
  });

  // CLIENT
  it('Un client ne peut pas créer un produit', async() => {
    mockCurrentRole = 'client';

  const productResponse = await request(app) 
  .post('/api/products') 
  .set('Authorization', 'Bearer token'); 

  console.log(productResponse.body);

  expect(productResponse.statusCode).toBe(403);
  
  });
});
