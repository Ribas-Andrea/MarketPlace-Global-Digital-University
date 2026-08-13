process.env.NODE_ENV = 'test';

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');

let mockCurrentRole = 'administrateur';
let userId;
let otherUserId;

// Mock du middleware auth pour simuler un utilisateur connecté
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

  // Création d'un utilisateur utilisé pour les tests
  const user = await User.create({
    _id: '6a7dc12c2f157c6b67176626',
    username: 'user@test.com',
    password: await bcrypt.hash('Password123', 10),
    role: 'client'
  });

  // Création d'un deuxième utilisateur pour tester les droits
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


// ============================================================
// GET /users/:id
// ============================================================

describe('GET /users/:id - cas d’erreur', () => {

  // Vérifie qu'un ID qui ne respecte pas le format MongoDB retourne une erreur 400
  it('Retourne 400 avec un ID invalide', async () => {
    const response = await request(app)
      .get('/api/users/123');

    console.log('GET user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant retourne une erreur 404
  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    const response = await request(app)
      .get('/api/users/6a7dc12c2f157c6b67176699');

    console.log('GET user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });
});


// ============================================================
// POST /users/
// ============================================================

describe('POST /users/ - cas d’erreur', () => {

  // Vérifie que l'inscription est refusée lorsque des données obligatoires sont absentes
  it('Retourne 400 si les données obligatoires sont absentes', async () => {
    const response = await request(app)
      .post('/api/users/')
      .send({});

    console.log('Register données manquantes :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'Email, password et role obligatoire'
    );
  });

  // Vérifie qu'un mot de passe qui ne respecte pas les règles de sécurité est refusé
  it('Retourne 400 avec un mot de passe trop faible', async () => {
    const response = await request(app)
      .post('/api/users/')
      .send({
        username: 'weak@test.com',
        password: 'password',
        role: 'client'
      });

    console.log('Register mot de passe faible :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Mot de passe trop faible');
  });

  // Vérifie qu'une inscription avec un username déjà utilisé est refusée
  it('Retourne 400 si le compte existe déjà', async () => {
    const response = await request(app)
      .post('/api/users/')
      .send({
        username: 'user@test.com',
        password: 'Password123',
        role: 'client'
      });

    console.log('Register compte existant :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Compte déjà existant');
  });
});


// ============================================================
// POST /users/login
// ============================================================

describe('POST /users/login - cas d’erreur', () => {

  // Vérifie que la connexion est refusée lorsque les données obligatoires sont absentes
  it('Retourne 400 si les données de connexion sont absentes', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({});

    console.log('Login données manquantes :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'Email, password et role obligatoire'
    );
  });

  // Vérifie qu'un utilisateur qui n'existe pas ne peut pas se connecter
  it('Retourne 400 avec un utilisateur inexistant', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'inexistant@test.com',
        password: 'Password123',
        role: 'client'
      });

    console.log('Login utilisateur inexistant :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Identifiant Invalides');
  });

  // Vérifie qu'un utilisateur avec un mauvais mot de passe ne peut pas se connecter
  it('Retourne 400 avec un mauvais mot de passe', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        username: 'user@test.com',
        password: 'WrongPassword123',
        role: 'client'
      });

    console.log('Login mauvais mot de passe :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Identifiant Invalides');
  });
});


// ============================================================
// PUT /users/:id
// ============================================================

describe('PUT /users/:id - cas d’erreur', () => {

  // Vérifie qu'un ID qui ne respecte pas le format MongoDB retourne une erreur 400
  it('Retourne 400 avec un ID invalide', async () => {
    const response = await request(app)
      .put('/api/users/123')
      .send({
        password: 'Password123'
      });

    console.log('PUT user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant retourne une erreur 404
  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    const response = await request(app)
      .put('/api/users/6a7dc12c2f157c6b67176699')
      .send({
        password: 'Password123'
      });

    console.log('PUT user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  // Vérifie que la modification du username est interdite
  it('Retourne 403 lors de la modification du username', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        username: 'nouveau@test.com'
      });

    console.log('PUT modification username :', response.body);

    expect(response.statusCode).toBe(403);
    expect(response.body.error).toBe(
      "Modification du nom d'utilisateur interdite"
    );
  });

  // Vérifie qu'un rôle qui n'existe pas dans la liste des rôles autorisés est refusé
  it('Retourne 400 avec un rôle invalide', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}`)
      .send({
        role: 'superadmin'
      });

    console.log('PUT rôle invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Rôle invalide');
  });
});


// ============================================================
// DELETE /users/:id
// ============================================================

describe('DELETE /users/:id - cas d’erreur', () => {

  // Vérifie qu'un ID qui ne respecte pas le format MongoDB retourne une erreur 400
  it('Retourne 400 avec un ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .delete('/api/users/123');

    console.log('DELETE user ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant retourne une erreur 404
  it('Retourne 404 si l’utilisateur n’existe pas', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .delete('/api/users/6a7dc12c2f157c6b67176699');

    console.log('DELETE user inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Utilisateur non trouvé');
  });

  // Vérifie qu'un client ne peut pas supprimer un autre utilisateur
  it('Retourne 403 si un utilisateur non administrateur tente de supprimer un autre utilisateur', async () => {
    mockCurrentRole = 'client';

    const response = await request(app)
      .delete(`/api/users/${otherUserId}`);

    console.log(
      'DELETE autre utilisateur par client :',
      response.body
    );

    expect(response.statusCode).toBe(403);
    expect(response.body.message).toBe(
      'Accès non autorisé pour votre rôle'
    );
  });
});