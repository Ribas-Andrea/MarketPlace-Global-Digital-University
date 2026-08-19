const cloudinary = require('cloudinary').v2;

const connectCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: 'cloudinaryMarketplace',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log('Cloudinary connectée');
  } catch (err) {
    console.error('Erreur Cloudinary :', err);
  }
};

module.exports = connectCloudinary;