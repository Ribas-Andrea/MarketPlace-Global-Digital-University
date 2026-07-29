const Order = require("../models/order");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Menu = require("../models/menu");

exports.getOrders = async (req, res) =>{
  try {
    const orders = await Order.find();

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération des commandes"
    });
  }
};

exports.getOrder = async (req, res) => {
 try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error: 'ID invalide'});

    const order = await Order.findById(id);
    if(!order)
      return res.status(404).json({error: 'Commande non trouvée'});

    res.status(200).json({order});

  } catch(err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
}

exports.createOrder = async (req, res) => {
 try {
  const { type, id_element, quantite } = req.body;

  let article; // défini l'article que l'on ajoute au panier(produit ou menu)

  if (type === "Product") {
    article = await Product.findById(id_element);
  } else if (type === "Menu") {
    article = await Menu.findById(id_element);
  } else {
    return res.status(400).json({
      error: "Type d'article invalide"
    });
  }

  if (!article) {
    return res.status(404).json({
      error: "Article non trouvé"
    });
  }

  const total = Math.round(article.prix * quantite * 100) / 100;
 
  // On peut ajouter les droits de l'utilisateur ici selon son rôle
 
  const order = new Order({
    articles: [
      {
        type,
        id_element,
        quantite
      }
    ],
    total
  });

  const savedOrder = await order.save();
  res.status(201).json(savedOrder);
  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'Erreur lors de la création de la commande'});
  }
}

exports.updateOrder = async (req, res) =>{

};

exports.deleteOrder = async (req, res) =>{

};