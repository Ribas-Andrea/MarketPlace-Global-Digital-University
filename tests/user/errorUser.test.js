process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

let mockCurrentRole = 'administrateur';
let userId;
let otherUserId;

jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      userId: '6a7dc12c2f157c6b67176626',
      role: mockCurrentRole
    };
    next();
  };
});

const app = require('../../index');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'test'
  });

  const user = await User.create({
    _id: '6a7dc12c2f157c6b67176626',
    username: 'user@test.com',
    password: await bcrypt.hash('Password123', 10),
    role: 'client'
  });

  const otherUser = await User.create({
    _id: '6a7dc12c2f157c6b67176627',
    username: 'other@test.com',
    password: await bcrypt.hash('Password123', 10),
    role: 'client'
  });

  userId = user._id.toString();
  otherUserId = otherUser._id.toString();

  console.log('User ID utilisé pour les tests :', userId);
  console.log('Other User ID utilisé pour les tests :', otherUserId);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('GET /users/:id - cas d’erreur', () => {
  it('Retourne 400 avec un ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).get('/api/users/123');

    console.log('GET user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).get('/api/users/6a7dc12c2f157c6b67176699');

    console.log('GET user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });
});

describe('POST /users/ - cas d’erreur', () => {
  it('Retourne 400 si les données obligatoires sont absentes', async () => {
    const response = await request(app).post('/api/users/').send({});

    console.log('Register données manquantes :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email et password obligatoire');
  });

  it('Retourne 400 avec un mot de passe trop faible', async () => {
    const response = await request(app).post('/api/users/').send({
      username: 'weak@test.com',
      password: 'password'
    });

    console.log('Register mot de passe faible :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Mot de passe trop faible');
  });

  it('Retourne 400 si le compte existe déjà', async () => {
    const response = await request(app).post('/api/users/').send({
      username: 'user@test.com',
      password: 'Password123'
    });

    console.log('Register compte existant :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Compte déjà existant');
  });

  it('Attribue automatiquement le rôle client lors de l’inscription', async () => {
    const response = await request(app).post('/api/users/').send({
      username: 'newuser@test.com',
      password: 'Password123'
    });

    console.log('Register nouvel utilisateur :', response.body);

    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe('newuser@test.com');
    expect(response.body.role).toBe('client');
  });
});

describe('POST /users/login - cas d’erreur', () => {
  it('Retourne 400 si les données de connexion sont absentes', async () => {
    const response = await request(app).post('/api/users/login').send({});

    console.log('Login données manquantes :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Email et password obligatoire');
  });

  it('Retourne 400 avec un utilisateur inexistant', async () => {
    const response = await request(app).post('/api/users/login').send({
      username: 'inexistant@test.com',
      password: 'Password123'
    });

    console.log('Login utilisateur inexistant :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Identifiant Invalides');
  });

  it('Retourne 400 avec un mauvais mot de passe', async () => {
    const response = await request(app).post('/api/users/login').send({
      username: 'user@test.com',
      password: 'WrongPassword123'
    });

    console.log('Login mauvais mot de passe :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Identifiant Invalides');
  });
});

describe('PUT /users/:id - cas d’erreur', () => {
  it('Retourne 400 avec un ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put('/api/users/123').send({
      password: 'Password123'
    });

    console.log('PUT user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put('/api/users/6a7dc12c2f157c6b67176699').send({
      password: 'Password123'
    });

    console.log('PUT user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  it('Retourne 403 lors de la modification du username', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put(`/api/users/${userId}`).send({
      username: 'nouveau@test.com'
    });

    console.log('PUT modification username :', response.body);

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe("Modification du nom d'utilisateur interdite");
  });

  it('Retourne 400 avec un rôle invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put(`/api/users/${userId}`).send({
      role: 'superadmin'
    });

    console.log('PUT rôle invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Rôle invalide');
  });
});

describe('DELETE /users/:id - cas d’erreur', () => {
  it('Retourne 400 avec un ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).delete('/api/users/123');

    console.log('DELETE user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).delete('/api/users/6a7dc12c2f157c6b67176699');

    console.log('DELETE user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  it('Retourne 403 si un client tente de supprimer un autre utilisateur', async () => {
    mockCurrentRole = 'client';

    const response = await request(app).delete(`/api/users/${otherUserId}`);

    console.log('DELETE autre utilisateur par client :', response.body);

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe('Accès non autorisé pour votre rôle');
  });
});
