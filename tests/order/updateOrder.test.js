process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const Product = require('../../models/product');
const Menu = require('../../models/menu');
const Order = require('../../models/order');

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
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PUT /orders/:id', () => {

  const roles = ['administrateur', 'accueil', 'client'];

  roles.forEach((role) => { 
    it(`Un ${role} peut modifier une commande`, async() => {
      mockCurrentRole = role;

    // Modification de la commande
    const orderResponse = await request(app)
      .put(`/api/orders/${orderId}`)
      .set('Authorization', 'Bearer token')
      .send({
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c99',
            quantite: 3,
      });
   
    console.log(orderResponse.body);

    // on s'attend à ce que le statuts de la réponse soit : 
    expect(orderResponse.statusCode).toBe(200);

    // on vérifie la commande :
    // article 1 : produit 
    expect(orderResponse.body.articles[0].type).toBe('Product');
    expect(orderResponse.body.articles[0].id_element).toBe('6a6b442e279ded257bfe5c99');
    expect(orderResponse.body.articles[0].quantite).toBe(3);
    expect(orderResponse.body.articles[0].totalArticle).toBe(10.8);
   });
  });


  // PREPARATEUR
  it('Un préparateur ne peut pas modifier une commande', async() => {
    mockCurrentRole = 'preparateur';

  const response = await request(app) 
  .put('/api/orders/:id')  
  .set('Authorization', 'Bearer token'); 

  expect(response.statusCode).toBe(403);
  
  });

});

