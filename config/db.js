const { default: mongoose } = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rdfu7fa.mongodb.net/marketplace?retryWrites=true&w=majority&appName=Cluster0`);
    console.log('MongoDB connectée');
  } catch (err) {
    console.error('Erreur MongoDB :', err);
  }
};

module.exports = connectDB;
