process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = require('../../index');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'test' });

  await request(app).post('/api/users').send({
    username: 'test1@test.fr',
    password: 'test123@456A'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /users/login', () => {
  it(`Un utilisateur peut se connecter à son compte`, async () => {
    const userResponse = await request(app).post('/api/users/login').send({
      username: 'test1@test.fr',
      password: 'test123@456A'
    });

    console.log(userResponse.body);

    expect(userResponse.statusCode).toBe(200);

    expect(userResponse.body.user.username).toBe('test1@test.fr');
    expect(userResponse.body.user.role).toBe('client');
    expect(userResponse.body.token).toBeDefined();

    const passwordIsValid = await bcrypt.compare('test123@456A', userResponse.body.user.password);

    expect(passwordIsValid).toBe(true);
  });
});
