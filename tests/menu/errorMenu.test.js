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

describe('Tests des erreurs Menu', () => {

  // ============================================================
  // GET /menus/:id
  // ============================================================

  it('GET /menus/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .get('/api/menus/123')
      .set('Authorization', 'Bearer token');

    console.log('GET menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('GET /menus/:id - menu inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/menus/${fakeId}`)
      .set('Authorization', 'Bearer token');

    console.log('GET menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Menu non trouvé');
  });

  // ============================================================
  // POST /menus
  // ============================================================

  it('POST /menus - image absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - image absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Image obligatoire');
  });

  it('POST /menus - catégorie absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - catégorie absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Catégorie obligatoire');
  });

  it('POST /menus - nom absent', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - nom absent :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Nom obligatoire');
  });

  it('POST /menus - prix absent', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - prix absent :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Prix obligatoire');
  });

  it('POST /menus - disponibilité absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - disponibilité absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Disponibilité obligatoire');
  });

  it('POST /menus - taille absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - taille absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Taille obligatoire');
  });

  it('POST /menus - accompagnement absent', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('boisson', 'Eau')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - accompagnement absent :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Accompagnement obligatoire');
  });

  it('POST /menus - boisson absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('sauce', 'Barbecue')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - boisson absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Boisson obligatoire');
  });

  it('POST /menus - sauce absente', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .post('/api/menus')
      .field('nom', 'Menu test')
      .field('prix', '10.8')
      .field('categorie', 'burgers')
      .field('disponible', 'true')
      .field('taille', 'Menu Best Of')
      .field('accompagnement', 'Frites')
      .field('boisson', 'Eau')
      .attach('imageBurger', 'tests/imagesTest/BIGMAC.png')
      .set('Authorization', 'Bearer token');

    console.log('Création menu - sauce absente :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Sauce obligatoire');
  });

  // ============================================================
  // PUT /menus/:id
  // ============================================================

  it('PUT /menus/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .put('/api/menus/123')
      .field('disponible', 'false')
      .set('Authorization', 'Bearer token');

    console.log('Modification menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('PUT /menus/:id - menu inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/menus/${fakeId}`)
      .field('disponible', 'false')
      .set('Authorization', 'Bearer token');

    console.log('Modification menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Menu non trouvé');
  });

  // ============================================================
  // DELETE /menus/:id
  // ============================================================

  it('DELETE /menus/:id - ID invalide', async () => {
    mockCurrentRole = 'administrateur';

    const response = await request(app)
      .delete('/api/menus/123')
      .set('Authorization', 'Bearer token');

    console.log('Suppression menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  it('DELETE /menus/:id - menu inexistant', async () => {
    mockCurrentRole = 'administrateur';

    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/menus/${fakeId}`)
      .set('Authorization', 'Bearer token');

    console.log('Suppression menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Menu non trouvé');
  });
});