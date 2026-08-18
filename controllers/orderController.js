const Order = require('../models/order');
const mongoose = require('mongoose');
const Product = require('../models/product');
const Menu = require('../models/menu');
const ROLES = require('../config/roles');

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1, _id: 1 });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des commandes'
    });
  }
};

exports.getOrdersPreparateur = async (req, res) => {
  try {
    const orders = await Order.find({ status: 'en_attente' }).sort({
      heureLivraison: 1,
      _id: 1
    });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des commandes à préparer'
    });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    if (
      req.user.role === ROLES.CLIENT &&
      order.user?.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        error: 'Vous ne pouvez consulter que vos propres commandes'
      });
    }


    if (
      req.user.role === ROLES.PREPARATEUR &&
      order.status !== 'en_attente'
    ) {
      return res.status(403).json({
        error: 'Le préparateur ne peut consulter que les commandes à préparer'
      });
    }

    res.status(200).json({
      order
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la récupération de la commande'
    });
  }
};

exports.getOrderByNumero = async (req, res) => {
  try {
    const { numeroCommande } = req.params;

    const numero = Number(numeroCommande);

    if (!Number.isInteger(numero) || numero <= 0) {
      return res.status(400).json({
        error: 'Numéro de commande invalide'
      });
    }

    const order = await Order.findOne({
      numeroCommande: numero
    });

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    res.status(200).json({
      order
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la récupération de la commande'
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (req.user?.role === ROLES.PREPARATEUR) {
      return res.status(403).json({
        error: 'Les préparateurs ne peuvent pas créer de commande'
      });
    }
    const { heureLivraison, articles: articlesRecus } = req.body;

    if (!articlesRecus || !Array.isArray(articlesRecus) || articlesRecus.length === 0) {
      return res.status(400).json({
        error: 'La commande doit contenir au moins un article'
      });
    }

    const derniereCommande = await Order.findOne().sort({ numeroCommande: -1 });

    const numeroCommande = derniereCommande ? derniereCommande.numeroCommande + 1 : 1;

    let articles = [];

    for (let i = 0; i < articlesRecus.length; i++) {
      const { type, id_element, quantite } = articlesRecus[i];

      let articlePanier;

      if (type === 'Product') {
        articlePanier = await Product.findById(id_element);
      } else if (type === 'Menu') {
        articlePanier = await Menu.findById(id_element);
      } else {
        return res.status(400).json({
          error: "Type d'article invalide"
        });
      }

      if (!articlePanier) {
        return res.status(404).json({
          error: 'Article non trouvé'
        });
      }

      const totalArticle = Number((articlePanier.prix * quantite).toFixed(2));

      articles.push({
        type,
        id_element,
        quantite,
        totalArticle
      });
    }

    const order = new Order({
      articles,
      heureLivraison,
      numeroCommande,
      user: req.user?.userId
    });

    const savedOrder = await order.save();

    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la création de la commande'
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const { type, id_element, quantite } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    if (req.user.role === ROLES.CLIENT && order.user?.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez modifier que vos propres commandes'
      });
    }

    const article = order.articles.find((a) => a.id_element.toString() === id_element);

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé dans la commande'
      });
    }

    const nouveauType = type || article.type;

    let articlePanier;

    if (nouveauType === 'Product') {
      articlePanier = await Product.findById(id_element);
    } else if (nouveauType === 'Menu') {
      articlePanier = await Menu.findById(id_element);
    } else {
      return res.status(400).json({
        error: "Type d'article invalide"
      });
    }

    if (!articlePanier) {
      return res.status(404).json({
        error: 'Article non trouvé'
      });
    }

    if (type) {
      article.type = type;
    }

    if (quantite !== undefined) {
      article.quantite = quantite;
    }

    article.totalArticle = Number((articlePanier.prix * article.quantite).toFixed(2));

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la modification de la commande'
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    req.order.status = req.body.status;

    await req.order.save();
    res.json(req.order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut de la commande' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    if (req.user.role === ROLES.CLIENT && order.user?.toString() !== req.user.userId) {
      return res.status(403).json({
        error: 'Vous ne pouvez supprimer que vos propres commandes'
      });
    }

    await order.deleteOne();

    res.json({
      message: 'Commande supprimée avec succès'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la suppression de la commande'
    });
  }
};
