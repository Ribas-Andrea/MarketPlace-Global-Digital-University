process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Product = require('../../models/product');

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
  await Product.create({
    _id: '6a6b442e279ded257bfe5c99',
    nom: 'Produit test',
    prix: 5.40,
    categorie: 'burgers',
    disponible: true,
    image: 'tests/imagesTest/BIGMAC.png'
  });
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});



describe('POST /orders', () => {

  const roles = ['administrateur', 'accueil', 'client'];

  roles.forEach((role) => { 
    it(`Un ${role} peut créer un menu`, async() => {
      mockCurrentRole = role;

      // Création de la commande
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer token')
        .send({
          articles: [
            {
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c99',
            quantite: 2,
            }
          ]
        });
        
        console.log(orderResponse.body);

          // on s'attend à ce que le statuts de la réponse soit : 
          expect(orderResponse.statusCode).toBe(201);
          // on vérifie le menu : 
          expect(orderResponse.body.articles[0].type).toBe('Product');
          expect(orderResponse.body.articles[0].id_element).toBe('6a6b442e279ded257bfe5c99');
          expect(orderResponse.body.articles[0].quantite).toBe(2);
          expect(orderResponse.body.articles[0].totalArticle).toBe(10.8);
          expect(orderResponse.body.status).toBe('brouillon');
    });
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas créer une comande', async() => {
    mockCurrentRole = 'preparateur';

  const orderResponse = await request(app) 
  .post('/api/orders') 
  .set('Authorization', 'Bearer token'); 

  console.log(orderResponse.body);

  expect(orderResponse.statusCode).toBe(403);
  
  });

});
