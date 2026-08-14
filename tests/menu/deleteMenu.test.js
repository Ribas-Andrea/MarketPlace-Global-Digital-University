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

describe('DELETE /menus/:id', () => {
  let menuId;

  beforeEach(async () => {
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

    menuId = menuResponse.body._id;
  });

  // ADMIN
  it('Un administrateur peut supprimer un menu', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).delete(`/api/menus/${menuId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(200);
  });

  // ACCUEIL
  it('Un membre de l’accueil ne peut pas supprimer un menu', async () => {
    mockCurrentRole = 'accueil';

    const response = await request(app).delete(`/api/menus/${menuId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });
  // PREPARATEUR
  it('Un préparateur ne peut pas supprimer un menu', async () => {
    mockCurrentRole = 'preparateur';

    const response = await request(app).delete(`/api/menus/${menuId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas supprimer un menu', async () => {
    mockCurrentRole = 'client';

    const response = await request(app).delete(`/api/menus/${menuId}`).set('Authorization', 'Bearer token');

    console.log(response.body);

    expect(response.statusCode).toBe(403);
  });
});
