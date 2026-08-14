process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });

  const userResponse = await request(app).post('/api/users').send({
    username: 'test3@test.fr',
    password: 'test123@456C'
  });

  userId = userResponse.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('PUT /users/:id', () => {
  // ADMIN
  it('Un administrateur peut modifier le rôle et le mot de passe d’un utilisateur', async () => {
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app).put(`/api/users/${userId}`).set('Authorization', 'Bearer token').send({
      password: 'test123@456D',
      role: 'preparateur'
    });

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(200);

    expect(userResponse.body.role).toBe('preparateur');

    const passwordIsValid = await bcrypt.compare('test123@456D', userResponse.body.password);

    expect(passwordIsValid).toBe(true);
  });

  // ADMIN modifie le mail : non autorisé
  it("Un administrateur ne peut pas modifier le mail d'un utilisateur", async () => {
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app).put(`/api/users/${userId}`).set('Authorization', 'Bearer token').send({
      username: 'test1@test.fr'
    });

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // ACCUEIL
  it("Un membre de l'accueil ne peut pas modifier un utilisateur", async () => {
    mockCurrentRole = 'accueil';

    const userResponse = await request(app).put(`/api/users/${userId}`).set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // PREPARATEUR
  it('Un préparateur ne peut pas modifier un utilisateur', async () => {
    mockCurrentRole = 'preparateur';

    const userResponse = await request(app).put(`/api/users/${userId}`).set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });

  // CLIENT
  it('Un client ne peut pas modifier un utilisateur', async () => {
    mockCurrentRole = 'client';

    const userResponse = await request(app).put(`/api/users/${userId}`).set('Authorization', 'Bearer token');

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(403);
  });
});
