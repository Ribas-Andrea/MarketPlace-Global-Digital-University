const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    nom: { type: String, required: true },
    prix: { type: Number, required: true },
    categorie: { type: String, required: true },
    disponible: { type: Boolean, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
