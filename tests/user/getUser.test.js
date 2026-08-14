process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });

  const userResponse = await request(app)
    .post('/api/users')
    .send({
      username: 'test1@test.fr',
      password: 'test123@456A'
    });

  userId = userResponse.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /users/:id', () => {
  // ADMIN
  it('Un administrateur peut afficher un utilisateur', async () => {
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    // On s'attend à ce que le statut de la réponse soit :
    expect(userResponse.statusCode).toBe(200);

    // On vérifie l'utilisateur :
    expect(userResponse.body.user).toBeDefined();
    expect(userResponse.body.user.username).toBe('test1@test.fr');
    expect(userResponse.body.user.role).toBe('client');

    // Vérification du mot de passe hashé
    const passwordIsValid = await bcrypt.compare(
      'test123@456A',
      userResponse.body.user.password
    );

    expect(passwordIsValid).toBe(true);
  });

  // ACCUEIL
  it("Un membre de l'accueil ne peut pas afficher un utilisateur", async () => {
    mockCurrentRole = 'accueil';

    const userResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas afficher un utilisateur', async () => {
    mockCurrentRole = 'preparateur';

    const userResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas afficher un utilisateur', async () => {
    mockCurrentRole = 'client';

    const userResponse = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });
});