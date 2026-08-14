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

describe('GET /menus', () => {
  let menuId;

  beforeAll(async () => {
    mockCurrentRole = 'administrateur';

    await request(app)
      .post('/api/menus')
      .field('nom', 'Mon menu 1')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Coca')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    await request(app)
      .post('/api/menus')
      .field('nom', 'Mon menu 2')
      .field('prix', '6.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Maxi Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Coca')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    await request(app)
      .post('/api/menus')
      .field('nom', 'Mon menu 3')
      .field('prix', '11.8')
      .field('categorie', 'burgers')
      .field('disponible', 'false')
      .field('taille', 'Menu Maxi Best Of')
      .field('accompagnement', 'Potatoes')
      .field('boisson', 'Eau')
      .field('sauce', 'Chinoise')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');
  });

  const roles = ['administrateur', 'accueil', 'preparateur', 'client'];

  roles.forEach((role) => {
    it(`Un ${role} peut afficher la liste des menus`, async () => {
      mockCurrentRole = role;

      const menuResponse = await request(app).get('/api/menus/').set('Authorization', 'Bearer token');

      console.log(menuResponse.body);

      expect(menuResponse.statusCode).toBe(200);
      expect(menuResponse.body.menus).toHaveLength(3);

      expect(menuResponse.body.menus[0].nom).toBe('Mon menu 1');
      expect(menuResponse.body.menus[0].prix).toBe(10.8);
      expect(menuResponse.body.menus[0].categorie).toBe('burgers');
      expect(menuResponse.body.menus[0].disponible).toBe(true);
      expect(menuResponse.body.menus[0].options.taille).toBe('Menu Best Of');
      expect(menuResponse.body.menus[0].options.accompagnement).toBe('Frites');
      expect(menuResponse.body.menus[0].options.boisson).toBe('Coca');
      expect(menuResponse.body.menus[0].options.sauce).toBe('Barbecue');
      expect(menuResponse.body.menus[0].imageBurger).toBeDefined();

      expect(menuResponse.body.menus[1].nom).toBe('Mon menu 2');
      expect(menuResponse.body.menus[1].prix).toBe(6.8);
      expect(menuResponse.body.menus[1].categorie).toBe('burgers');
      expect(menuResponse.body.menus[1].disponible).toBe(true);
      expect(menuResponse.body.menus[1].options.taille).toBe('Menu Maxi Best Of');
      expect(menuResponse.body.menus[1].options.accompagnement).toBe('Frites');
      expect(menuResponse.body.menus[1].options.boisson).toBe('Coca');
      expect(menuResponse.body.menus[1].options.sauce).toBe('Barbecue');
      expect(menuResponse.body.menus[1].imageBurger).toBeDefined();

      expect(menuResponse.body.menus[2].nom).toBe('Mon menu 3');
      expect(menuResponse.body.menus[2].prix).toBe(11.8);
      expect(menuResponse.body.menus[2].categorie).toBe('burgers');
      expect(menuResponse.body.menus[2].disponible).toBe(false);
      expect(menuResponse.body.menus[2].options.taille).toBe('Menu Maxi Best Of');
      expect(menuResponse.body.menus[2].options.accompagnement).toBe('Potatoes');
      expect(menuResponse.body.menus[2].options.boisson).toBe('Eau');
      expect(menuResponse.body.menus[2].options.sauce).toBe('Chinoise');
      expect(menuResponse.body.menus[2].imageBurger).toBeDefined();
    });
  });
});
