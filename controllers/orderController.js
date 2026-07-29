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

    let articlePanier;

    if (type === "Product") {
      articlePanier = await Product.findById(id_element);
    } else if (type === "Menu") {
      articlePanier = await Menu.findById(id_element);
    } else {
      return res.status(400).json({
        error: "Type d'article invalide"
      });
    }

    if (!articlePanier) {
      return res.status(404).json({
        error: "Article non trouvé"
      });
    }

    const totalArticle = Number(
      (articlePanier.prix * quantite).toFixed(2)
    );

    const order = new Order({
      articles: [
        {
          type,
          id_element,
          quantite,
          totalArticle
        }
      ]
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erreur lors de la création de la commande"
    });
  }
};

exports.updateOrder = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  const { type, id_element, quantite } = req.body;

  const order = await Order.findById(id);
  if(!order){
  return res.status(404).json({error: 'Commande non trouvé'});
  }

  const article = order.articles.find(
  a => a.id_element.toString() === id_element
  );

  if (!article) {
    return res.status(404).json({
      error: "Article non trouvé dans la commande"
    });
  }



  // Les données modifiées : 
  if(type)
      article.type = type;

  if(quantite!== undefined)
      article.quantite = quantite;

  // On sauvegarde le produit : 

  const updatedOrder = await order.save();
  res.json(updatedOrder);

  } catch(err) {
    console.error(err);
    res.status(500).json({error: 'Erreur lors de la modification de la commande'});
  }
};

exports.updateOrderStatus = async (req, res) =>{

};


exports.deleteOrder = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  
  const order = await Order.findById(id);
  if(!order){
  return res.status(404).json({error: 'Commande non trouvée'});
  }


  // Les données modifiées : 
  await order.deleteOne();
  res.json({message: 'Commande supprimée avec succès'});



} catch(err) {
  console.error(err);
  res.status(500).json({error: 'Erreur lors de la suppression de la commande'});
}
};