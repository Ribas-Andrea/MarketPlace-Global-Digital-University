process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

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

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });
});

afterAll(async () => {
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

      const menuResponse = await request(app)
        .get('/api/menus/' + menuId)
        .set('Authorization', 'Bearer token');

      console.log(menuResponse.body);

      expect(menuResponse.statusCode).toBe(200);
      expect(menuResponse.body.menu.nom).toBe('Mon menu');
      expect(menuResponse.body.menu.prix).toBe(10.8);
      expect(menuResponse.body.menu.categorie).toBe('burgers');
      expect(menuResponse.body.menu.disponible).toBe(true);
      expect(menuResponse.body.menu.options.taille).toBe('Menu Best Of');
      expect(menuResponse.body.menu.options.accompagnement).toBe('Frites');
      expect(menuResponse.body.menu.options.boisson).toBe('Coca');
      expect(menuResponse.body.menu.options.sauce).toBe('Barbecue');
      expect(menuResponse.body.menu.imageBurger).toBeDefined();
    });
  });
});
