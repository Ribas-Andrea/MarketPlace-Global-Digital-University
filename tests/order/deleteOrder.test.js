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
let listOrderId = [];

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
  const roles = ['administrateur', 'accueil', 'client'];

  for (let index = 0; index < roles.length; index++) {
    console.log(index)
    await Product.create({
      _id: '6a6b442e279ded257bfe5c9' + index.toString(),
      nom: 'Produit test',
      prix: 5.40,
      categorie: 'burgers',
      disponible: true,
      image: 'tests/imagesTest/BIGMAC.png'
    });
    await Menu.create({
      _id: '7a6b442e279ded257bfe5c9' + index.toString(),
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
          id_element: '6a6b442e279ded257bfe5c9' + index.toString(),
          quantite: 2,
          totalArticle: 10.8
        },
        {
          type: 'Menu',
          id_element: '7a6b442e279ded257bfe5c9' + index.toString(),
          quantite: 2,
          totalArticle: 22
        }
      ]
    });
    console.log(order._id.toString())
    listOrderId.push(order._id.toString());
  };
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('DELETE /orders/:id', () => {

  const roles = ['administrateur', 'accueil', 'client'];

  roles.forEach((role, index) => { 
    it(`Un ${role} peut supprimer une commande`, async() => {
      mockCurrentRole = role;
      console.log(role, listOrderId)
    // Suppression d'une commande
    const orderResponse = await request(app)
      .delete(`/api/orders/${listOrderId[index]}`)
      .set('Authorization', 'Bearer token')
   
    console.log(orderResponse.body);

      // on s'attend à ce que le statuts de la réponse soit : 
      expect(orderResponse.statusCode).toBe(200);


    });
  });


  // PREPARATEUR
  it('Un préparateur ne peut pas supprimer une commande', async() => {
    mockCurrentRole = 'preparateur';

  const orderResponse = await request(app) 
  .delete(`/api/orders/${listOrderId[0]}`)
  .set('Authorization', 'Bearer token'); 

  console.log(orderResponse.body);

  expect(orderResponse.statusCode).toBe(403);
  
  });



});

