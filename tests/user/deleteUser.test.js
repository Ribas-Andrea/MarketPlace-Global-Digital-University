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
let userId;


beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
  const userResponse = await request(app)
    .post('/api/users')
    .send({
      username: 'test3@test.fr',
      password: 'test123@456C',
      role: 'preparateur'
    });

  userId = userResponse.body._id;
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('DELETE /users/:id', () => {

// ADMIN
  it('Un administrateur peut supprimer un utilsateur', async () => { 
    mockCurrentRole = 'administrateur';

    const userResponse = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', 'Bearer token')


    console.log(userResponse.body);

    // on s'attend à ce que le statuts de la réponse soit : 
    expect(userResponse.statusCode).toBe(200);

    });

// ACCUEIL
  it('Un membre de l’accueil ne peut pas supprimer un utilisateur', async() => {
    mockCurrentRole = 'accueil';

  const userResponse = await request(app) 
  .delete(`/api/users/${userId}`)
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);


  });

// PREPARATEUR
  it('Un preparateur ne peut pas supprimer un utilisateur', async() => {
    mockCurrentRole = 'preparateur';

  const userResponse = await request(app) 
  .delete(`/api/users/${userId}`)
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);

  });

  // CLIENT
  it('Un client ne peut pas supprimer un utilisateur', async() => {
    mockCurrentRole = 'client';

  const userResponse = await request(app) 
  .delete(`/api/users/${userId}`)
  .set('Authorization', 'Bearer token'); 

  console.log(userResponse.body);

  expect(userResponse.statusCode).toBe(403);

  });


});
