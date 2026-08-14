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

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la récupération d'un menu.
  it('GET /menus/:id - ID invalide', async () => {
    const response = await request(app)
      .get('/api/menus/123');

    console.log('GET menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant renvoie une erreur 404.
  it('GET /menus/:id - menu inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/menus/${fakeId}`);

    console.log('GET menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Menu non trouvé');
  });

  // Vérifie qu'un menu ne peut pas être créé sans image.
  it('POST /menus - image absente', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans catégorie.
  it('POST /menus - catégorie absente', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans nom.
  it('POST /menus - nom absent', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans prix.
  it('POST /menus - prix absent', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans disponibilité.
  it('POST /menus - disponibilité absente', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans taille.
  it('POST /menus - taille absente', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans accompagnement.
  it('POST /menus - accompagnement absent', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans boisson.
  it('POST /menus - boisson absente', async () => {
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

  // Vérifie qu'un menu ne peut pas être créé sans sauce.
  it('POST /menus - sauce absente', async () => {
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

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la modification.
  it('PUT /menus/:id - ID invalide', async () => {
    const response = await request(app)
      .put('/api/menus/123')
      .field('disponible', 'false')
      .set('Authorization', 'Bearer token');

    console.log('Modification menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant renvoie une erreur 404 lors de la modification.
  it('PUT /menus/:id - menu inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .put(`/api/menus/${fakeId}`)
      .field('disponible', 'false')
      .set('Authorization', 'Bearer token');

    console.log('Modification menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Menu non trouvé');
  });

  // Vérifie qu'un ID invalide renvoie une erreur 400 lors de la suppression.
  it('DELETE /menus/:id - ID invalide', async () => {
    const response = await request(app)
      .delete('/api/menus/123')
      .set('Authorization', 'Bearer token');

    console.log('Suppression menu - ID invalide :', response.body);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('ID invalide');
  });

  // Vérifie qu'un ID valide mais inexistant renvoie une erreur 404 lors de la suppression.
  it('DELETE /menus/:id - menu inexistant', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/menus/${fakeId}`)
      .set('Authorization', 'Bearer token');

    console.log('Suppression menu - menu inexistant :', response.body);

    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('Produit non trouvé');
  });
});