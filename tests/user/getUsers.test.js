process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mockCurrentRole = 'administrateur';

// On fait un mock pour simuler la connexion :
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

  await request(app)
    .post('/api/users')
    .send({
      username: 'test1@test.fr',
      password: 'test123@456A'
    });

  await request(app)
    .post('/api/users')
    .send({
      username: 'test2@test.fr',
      password: 'test123@456B'
    });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /users', () => {
  // ADMIN
  it('Un administrateur peut afficher la liste des utilisateurs', async () => {
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    // On s'attend à ce que le statut de la réponse soit :
    expect(userResponse.statusCode).toBe(200);

    // On vérifie la liste des utilisateurs :
    expect(userResponse.body.users).toBeDefined();
    expect(userResponse.body.users.length).toBeGreaterThan(0);

    expect(userResponse.body.users[0].username).toBe('test1@test.fr');
    expect(userResponse.body.users[0].role).toBe('client');

    expect(userResponse.body.users[1].username).toBe('test2@test.fr');
    expect(userResponse.body.users[1].role).toBe('client');
  });

  // ACCUEIL
  it("Un membre de l'accueil ne peut pas afficher la liste des utilisateurs", async () => {
    mockCurrentRole = 'accueil';

    const userResponse = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas afficher la liste des utilisateurs', async () => {
    mockCurrentRole = 'preparateur';

    const userResponse = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas afficher la liste des utilisateurs', async () => {
    mockCurrentRole = 'client';

    const userResponse = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });
});