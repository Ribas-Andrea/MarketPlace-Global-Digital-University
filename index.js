require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const setupSwagger = require('./swaggerConfig');
app.use(helmet());
app.use(cors());
app.use(
  rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100
  })
);

app.use(express.json());

app.use(express.static('uploads'));

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/menus', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/docs', require('./swaggerConfig'));

setupSwagger(app);

if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => console.log('Serveur running'));
}

module.exports = app;
