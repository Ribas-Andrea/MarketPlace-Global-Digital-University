const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerYamljs = require('yamljs');

const options = {
  definition: {
    openapi: '3.1.1',
    info: {
      title: 'API de gestion de projets',
      version: '1.0.0',
      description: "Documentation de l'API permettant de gérer les utilisateurs, les produits, les menus et les commandes"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    servers: [{ url: 'https://marketplace-seven-steel.vercel.app/api' }] // mettre url vercel
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
