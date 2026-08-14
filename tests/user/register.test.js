process.env.NODE_ENV = "test";

const request = require("supertest");
const {MongoMemoryServer} = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = require("../../index");

let mongoServer;


beforeAll(async() => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {dbName: 'test'});
})

afterAll(async() => {
  await mongoose.disconnect();
  await mongoServer.stop();
});


describe('POST /users', () => {

    it(`Un utilisateur peut créer un compte`, async() => {
      const userResponse = await request(app)
        .post('/api/users')
        .send({
          username: 'test1@test.fr',
          password: 'test123@456A',
          role: 'administrateur'
        });

      console.log(userResponse.body);

      // on s'attend à ce que le statuts de la réponse soit : 
      expect(userResponse.statusCode).toBe(201);
      // on vérifie l'utilisateur : 
      expect(userResponse.body.username).toBe('test1@test.fr');
      expect(userResponse.body.role).toBe('administrateur');

      // Vérification du mot de passe hashé
      const passwordIsValid = await bcrypt.compare(
        "test123@456A",
        userResponse.body.password
      );

    expect(passwordIsValid).toBe(true);
    });
});
