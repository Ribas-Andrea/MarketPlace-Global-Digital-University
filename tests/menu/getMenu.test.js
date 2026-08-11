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

describe('GET /menus/:id', () => {
 let menuId;

  beforeAll(async () => {
    mockCurrentRole = 'administrateur';

    const menuResponse = await request(app)
      .post('/api/menus')
      .field('nom', 'Mon menu')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Coca')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    expect(menuResponse.statusCode).toBe(201);

    menuId = menuResponse.body._id;

  });

  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => { 
    it(`Un ${role} peut afficher un menu`, async () => { 
      mockCurrentRole = role;

      // Récupération du menu
      const response = await request(app)
      .get('/api/menus/' + menuId)
      .set('Authorization', 'Bearer token');

      console.log(response.body);

        // on vérifie le menu : 
        expect(response.statusCode).toBe(200);
        expect(response.body.menu.nom).toBe('Mon menu');
        expect(response.body.menu.prix).toBe(10.8);
        expect(response.body.menu.categorie).toBe('burgers');
        expect(response.body.menu.disponible).toBe(true);
        expect(response.body.menu.options.taille).toBe('Menu Best Of');
        expect(response.body.menu.options.accompagnement).toBe('Frites');
        expect(response.body.menu.options.boisson).toBe('Coca');
        expect(response.body.menu.options.sauce).toBe('Barbecue');
        expect(response.body.menu.imageBurger).toBeDefined();
    });
  });
});

