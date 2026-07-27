const {default: mongoose} = require ('mongoose');

const connectDB = async ()  => {
  try {
      await mongoose.connect('mongodb+srv://DB_USER:DB_PASSWORD@cluster0.rdfu7fa.mongodb.net/?appName=Cluster0');
      console.log("MongoDB connectée");
    } catch (err) {
      console.error(err.message);
  }
}

module.exports = connectDB;
