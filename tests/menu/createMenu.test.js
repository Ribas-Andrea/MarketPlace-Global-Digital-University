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

describe('POST /menus', () => {
  // ADMIN
  it('Un administrateur peut créer un menu', async () => {
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

    console.log(menuResponse.body);

    expect(menuResponse.statusCode).toBe(201);

    expect(menuResponse.body.nom).toBe('Mon menu');
    expect(menuResponse.body.prix).toBe(10.8);
    expect(menuResponse.body.categorie).toBe('burgers');
    expect(menuResponse.body.disponible).toBe(true);
    expect(menuResponse.body.options.taille).toBe('Menu Best Of');
    expect(menuResponse.body.options.accompagnement).toBe('Frites');
    expect(menuResponse.body.options.boisson).toBe('Coca');
    expect(menuResponse.body.options.sauce).toBe('Barbecue');
    expect(menuResponse.body.imageBurger).toBeDefined();
  });

  // ACCUEIL
  it('Un membre de l’accueil ne peut pas créer un menu', async () => {
    mockCurrentRole = 'accueil';

    const menuResponse = await request(app).post('/api/menus').set('Authorization', 'Bearer token');

    console.log(menuResponse.body);

    expect(menuResponse.statusCode).toBe(403);
  });
  // PREPARATEUR
  it('Un préparateur ne peut pas créer un menu', async () => {
    mockCurrentRole = 'preparateur';

    const menuResponse = await request(app).post('/api/menus').set('Authorization', 'Bearer token');

    console.log(menuResponse.body);

    expect(menuResponse.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas créer un menu', async () => {
    mockCurrentRole = 'client';

    const menuResponse = await request(app).post('/api/menus').set('Authorization', 'Bearer token');

    console.log(menuResponse.body);

    expect(menuResponse.statusCode).toBe(403);
  });
});
