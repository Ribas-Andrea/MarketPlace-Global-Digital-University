const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Product', 'Menu'],
      required: true
    },
    id_element: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'articles.type',
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    totalArticle: {
      type: Number,
      default: 0
    },
    
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
     user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    articles: [articleSchema],
    status: {
      type: String,
      enum: ['brouillon', 'en_attente', 'preparee', 'livree'],
      default: 'brouillon'
    },
    heureLivraison: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
