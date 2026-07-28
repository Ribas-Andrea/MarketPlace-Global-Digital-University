const mongoose = require ('mongoose');

const menuSchema = new mongoose.Schema({
  image: {type: String, required: true},
  nom: {type: String, required: true},
  prix: {type: Number, required: true},
  categorie: {type: String, required: true},
  options: {
    taille: {
      type: String, 
      enum: ['Menu Best Of', 'Menu Maxi Best Of'],
      required: true},
    accompagnement: {
      type: String, 
      enum: ['Frites', 'Potatoes'],
      required: true},
    boisson: {
      type: String, 
      required: true},
    sauce: {
      type: String, 
      required: true}
  }
}, {timestamps: true});


module.exports = mongoose.model("Menu", menuSchema);