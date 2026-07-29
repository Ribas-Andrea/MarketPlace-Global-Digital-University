const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Product", "Menu"],
    required: true
  },
  id_element: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "articles.type",
    required: true
  },
  quantite: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  articles: [articleSchema],
  total: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);