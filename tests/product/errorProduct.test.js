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

  await mongoose.connect(mongoServer.getUri(), {
    dbName: 'test'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Tests des erreurs Product', () => {
  it('GET /products/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).get('/api/products/123').set('Authorization', 'Bearer token');

    console.log('GET produit - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('GET /products/:id - produit inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).get(`/api/products/${fakeId}`).set('Authorization', 'Bearer token');

    console.log('GET produit - produit inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Produit non trouvé');
  });

  it('POST /products - image absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/products')
      .field('nom', 'Produit test')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .set('Authorization', 'Bearer token');

    console.log('Création produit - image absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Image obligatoire');
  });

  it('POST /products - catégorie absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/products')
      .field('nom', 'Produit test')
      .field('prix', '8.8')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création produit - catégorie absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Catégorie obligatoire');
  });

  it('POST /products - nom absent', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/products')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création produit - nom absent :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Nom obligatoire');
  });

  it('POST /products - prix absent', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/products')
      .field('nom', 'Produit test')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création produit - prix absent :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Prix obligatoire');
  });

  it('POST /products - disponibilité absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/products')
      .field('nom', 'Produit test')
      .field('prix', '8.8')
      .field('categorie', 'burgers')
      .attach('image', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création produit - disponibilité absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Disponibilité obligatoire');
  });

  it('PUT /products/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).put('/api/products/123').field('disponible', 'false').set('Authorization', 'Bearer token');

    console.log('Modification produit - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('PUT /products/:id - produit inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).put(`/api/products/${fakeId}`).field('disponible', 'false').set('Authorization', 'Bearer token');

    console.log('Modification produit - produit inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Produit non trouvé');
  });

  it('DELETE /products/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app).delete('/api/products/123').set('Authorization', 'Bearer token');

    console.log('Suppression produit - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('DELETE /products/:id - produit inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).delete(`/api/products/${fakeId}`).set('Authorization', 'Bearer token');

    console.log('Suppression produit - produit inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Produit non trouvé');
  });
});
