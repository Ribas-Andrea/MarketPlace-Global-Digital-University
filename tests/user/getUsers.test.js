process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let mockCurrentRole = 'administrateur';

// on fait unn moke pour simuler la connexion : 
jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    req.user = {
      userId: '6a58e381df483c9e75bdbb2d', // on met n'importe quel id
      role: mockCurrentRole
    };
    next();
  };
})

const app = require("../../index");

let mongoServer;


beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
  await request(app)
  .post('/api/users')
  .send({
    username: 'test1@test.fr',
    password: 'test123@456A',
    role: 'administrateur'
  });
  await request(app)
  .post('/api/users')
  .send({
    username: 'test2@test.fr',
    password: 'test123@456B',
    role: 'accueil'
  });
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('GET /users', () => {

// ADMIN
  it('Un administrateur peut afficher la liste des utilsateurs', async () => { 
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer token'); 

    console.log(userResponse.body);

    // on s'attend à ce que le statuts de la réponse soit : 
    expect(userResponse.statusCode).toBe(200);
    // on vérifie l'utilisateur : 

    expect(userResponse.body.users).toBeDefined();
    expect(userResponse.body.users.length).toBeGreaterThan(0);

    expect(userResponse.body.users[0].username).toBe('test1@test.fr');
    expect(userResponse.body.users[0].role).toBe('administrateur');

    // Vérification du mot de passe hashé
      const passwordIsValid = await bcrypt.compare(
        "test123@456A",
        userResponse.body.users[0].password
      );

      expect(passwordIsValid).toBe(true);

    });

// ACCUEIL
  it('Un membre de l’accueil ne peut pas afficher la liste des utilisateurs', async() => {
    mockCurrentRole = 'accueil';

  const userResponse = await request(app) 
  .get('/api/users') 
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);


  });

// PREPARATEUR
  it('Un preparateur ne peut pas afficher la liste des utilisateurs', async() => {
    mockCurrentRole = 'preparateur';

  const userResponse = await request(app) 
  .get('/api/users') 
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);

  });

  // CLIENT
  it('Un client ne peut pas afficher la liste des utilisateurs', async() => {
    mockCurrentRole = 'client';

  const userResponse = await request(app) 
  .get('/api/users') 
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);

  });


});
