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

beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
  await Product.create(
    {
      _id: '6a6b442e279ded257bfe5c10',
      nom: 'BigMAc',
      prix: 8.60,
      categorie: 'burgers',
      disponible: true,
      image: 'tests/imagesTest/BIGMAC.png'
    },
    {
      _id: '6a6b442e279ded257bfe5c20',
      nom: 'Coca-cola',
      prix: 2.40,
      categorie: 'boisson',
      disponible: true,
      image: 'tests/imagesTest/coca-cola.png'
    },
    {
      _id: '6a6b442e279ded257bfe5c30',
      nom: 'Frites',
      prix: 5.40,
      categorie: 'frites',
      disponible: true,
      image: 'tests/imagesTest/GRANDE_FRITE.png'
    },
  );
    await Menu.create({
      _id: '7a6b442e279ded257bfe5c40',
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
    const order = await Order.create([
      {
        articles: [
          {
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c10',
            quantite: 1,
            totalArticle: 8.6
          }
        ]
      },
      {
        articles: [
          {
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c20',
            quantite: 2,
            totalArticle: 4.8
          },
                    {
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c30',
            quantite: 2,
            totalArticle: 10.8
          }
        ],
      },
      {
        articles: [
          {
            type: 'Product',
            id_element: '6a6b442e279ded257bfe5c30',
            quantite: 2,
            totalArticle: 10.8
          },
          {
            type: 'Menu',
            id_element: '7a6b442e279ded257bfe5c40',
            quantite: 2,
            totalArticle: 22
          }
        ]
      }
  ]);
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /orders', () => {

  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => { 
   it(`Un ${role} peut afficher la liste des commandes`, async () => {
      mockCurrentRole = role;
      // Récupération des commandes
      const ordersResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer token');

      console.log("body", ordersResponse.body);
      console.log("orders", ordersResponse.body.orders);
      console.log("orders_0", ordersResponse.body.orders[0]);
      console.log("orders_0_articles", ordersResponse.body.orders[0].articles);
      console.log("orders_0_articles_0", ordersResponse.body.orders[0].articles[0]);
      console.log(
  ordersResponse.body.orders.map((order) => ({
    id: order._id,
    createdAt: order.createdAt,
    firstArticle: order.articles[0].id_element
  }))
);
      // On vérifie la réponse
      expect(ordersResponse.statusCode).toBe(200);

      // On vérifie qu'il y a bien 3 commandes
      expect(ordersResponse.body.orders).toHaveLength(3);

      
      // on vérifie les commandes : 

      // Ma première commadne
        expect(ordersResponse.body.orders[0].articles[0].type).toBe('Product');
        expect(ordersResponse.body.orders[0].articles[0].id_element).toBe('6a6b442e279ded257bfe5c10');
        expect(ordersResponse.body.orders[0].articles[0].quantite).toBe(1);
        expect(ordersResponse.body.orders[0].articles[0].totalArticle).toBe(8.6);
        expect(ordersResponse.body.orders[0].status).toBe('brouillon');

      // Ma deuxième commande
      // article 1 : produit
        expect(ordersResponse.body.orders[1].articles[0].type).toBe('Product');
        expect(ordersResponse.body.orders[1].articles[0].id_element).toBe('6a6b442e279ded257bfe5c20');
        expect(ordersResponse.body.orders[1].articles[0].quantite).toBe(2);
        expect(ordersResponse.body.orders[1].articles[0].totalArticle).toBe(4.8);
      // article 2 : produit
        expect(ordersResponse.body.orders[1].articles[1].type).toBe('Product');
        expect(ordersResponse.body.orders[1].articles[1].id_element).toBe('6a6b442e279ded257bfe5c30');
        expect(ordersResponse.body.orders[1].articles[1].quantite).toBe(2);
        expect(ordersResponse.body.orders[1].articles[1].totalArticle).toBe(10.8);
      // Status de la deuxième commande
        expect(ordersResponse.body.orders[1].status).toBe('brouillon');

      // Ma troisième commande
      // article 1 : produit 
        expect(ordersResponse.body.orders[2].articles[0].type).toBe('Product');
        expect(ordersResponse.body.orders[2].articles[0].id_element).toBe('6a6b442e279ded257bfe5c30');
        expect(ordersResponse.body.orders[2].articles[0].quantite).toBe(2);
        expect(ordersResponse.body.orders[2].articles[0].totalArticle).toBe(10.8);
        // article 2 : menu 
        expect(ordersResponse.body.orders[2].articles[1].type).toBe('Menu');
        expect(ordersResponse.body.orders[2].articles[1].id_element).toBe('7a6b442e279ded257bfe5c40');
        expect(ordersResponse.body.orders[2].articles[1].quantite).toBe(2);
        expect(ordersResponse.body.orders[2].articles[1].totalArticle).toBe(22);
        // Status de la commande
        expect(ordersResponse.body.orders[2].status).toBe('brouillon');

    });
  });
}); 