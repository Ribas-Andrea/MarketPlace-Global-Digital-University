const mongoose = require ('mongoose');

const orderSchema = new mongoose.Schema({
  titre: {
    quantité: {
      type: Number, 
      required: true
    },
    taille: {
      type: String, 
      enum: ['Menu Best Of', 'Menu Maxi Best Of'],
      required: true
    },
    nom: {
      type: String,
      required: true
    }
  },
  options: {
    accompagnement: {
      type: String, 
      enum: ['Frites', 'Potatoes'],
      required: true
    },
    boisson: {
      type: String, 
      required: true
    },
    sauce: {
      type: String, 
      required: true
    },
  },
  image: {type: String, required: true},
  prix: {type: Number, required: true}
}, {timestamps: true});


module.exports = mongoose.model("Order", orderSchema);