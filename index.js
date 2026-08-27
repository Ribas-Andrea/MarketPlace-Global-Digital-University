require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const setupSwagger = require('./config/swaggerConfig');
const connectCloudinary = require('./config/cloudinary');

const app = express();

app.set('trust proxy', 1);

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

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Marketplace opérationnelle',
    status: 'OK'
  });
});

setupSwagger(app);

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(3000, () => {
    console.log('Serveur running on http://localhost:3000');
  });
}

module.exports = app;