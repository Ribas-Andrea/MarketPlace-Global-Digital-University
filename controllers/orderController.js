const Order = require('../models/order');
const mongoose = require('mongoose');
const Product = require('../models/product');
const Menu = require('../models/menu');
const ROLES = require('../config/roles');
const crypto = require('crypto');

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
      req.user?.role === ROLES.CLIENT &&
      order.user?.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        error: 'Vous ne pouvez consulter que vos propres commandes'
      });
    }

    if (
      req.user?.role === ROLES.PREPARATEUR &&
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
    if (req.order) {
      return res.status(200).json({
        order: req.order
      });
    }

    return res.status(404).json({
      error: 'Commande non trouvée'
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
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

    if (!heureLivraison) {
      return res.status(400).json({
        error: "L'heure de livraison est obligatoire"
      });
    }

    if (!articlesRecus || !Array.isArray(articlesRecus) || articlesRecus.length === 0) {
      return res.status(400).json({
        error: 'La commande doit contenir au moins un article'
      });
    }

    const derniereCommande = await Order.findOne().sort({
      numeroCommande: -1
    });

    const numeroCommande = derniereCommande
      ? derniereCommande.numeroCommande + 1
      : 1;

    const articles = [];

    for (const articleRecu of articlesRecus) {
      const { type, id_element, quantite } = articleRecu;

      if (!id_element) {
        return res.status(400).json({
          error: "L'identifiant de l'article est obligatoire"
        });
      }

      if (!mongoose.Types.ObjectId.isValid(id_element)) {
        return res.status(400).json({
          error: "Identifiant de l'article invalide"
        });
      }

      if (!Number.isInteger(quantite) || quantite < 1) {
        return res.status(400).json({
          error: 'La quantité doit être un entier supérieur ou égal à 1'
        });
      }

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

      if (!articlePanier.disponible) {
        return res.status(400).json({
          error: 'Cet article est actuellement indisponible'
        });
      }

      const totalArticle = Number(
        (articlePanier.prix * quantite).toFixed(2)
      );

      articles.push({
        type,
        id_element,
        quantite,
        totalArticle
      });
    }

    const codeCommande = !req.user
      ? crypto.randomInt(1000, 10000).toString()
      : undefined;

    const order = new Order({
      articles,
      heureLivraison,
      numeroCommande,
      user: req.user?.userId,
      codeCommande
    });

    const savedOrder = await order.save();

    const response = savedOrder.toObject();

    if (codeCommande) {
      response.codeCommande = codeCommande;
    }

    return res.status(201).json(response);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Erreur lors de la création de la commande'
    });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    let order;

    if (req.order) {
      order = req.order;
    } else {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'ID invalide'
        });
      }

      order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Commande non trouvée'
        });
      }

      if (
        req.user?.role === ROLES.CLIENT &&
        order.user?.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          error: 'Vous ne pouvez modifier que vos propres commandes'
        });
      }
    }

    const { type, id_element } = req.body;

    const quantite =
      req.body.quantite !== undefined
        ? Number(req.body.quantite)
        : undefined;

    if (!id_element) {
      return res.status(400).json({
        error: "L'identifiant de l'article est obligatoire"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id_element)) {
      return res.status(400).json({
        error: "Identifiant de l'article invalide"
      });
    }

    const article = order.articles.find(
      (a) => a.id_element.toString() === id_element
    );

    if (!article) {
      return res.status(404).json({
        error: 'Article non trouvé dans la commande'
      });
    }

    const nouveauType = type || article.type;

    if (!['Product', 'Menu'].includes(nouveauType)) {
      return res.status(400).json({
        error: "Type d'article invalide"
      });
    }

    if (req.body.quantite !== undefined) {
      if (!Number.isInteger(quantite) || quantite < 1) {
        return res.status(400).json({
          error: 'La quantité doit être un entier supérieur ou égal à 1'
        });
      }

      article.quantite = quantite;
    }

    let articlePanier;

    if (nouveauType === 'Product') {
      articlePanier = await Product.findById(id_element);
    } else {
      articlePanier = await Menu.findById(id_element);
    }

    if (!articlePanier) {
      return res.status(404).json({
        error: 'Article non trouvé'
      });
    }

    if (!articlePanier.disponible) {
      return res.status(400).json({
        error: 'Cet article est actuellement indisponible'
      });
    }

    article.type = nouveauType;
    article.id_element = id_element;

    article.totalArticle = Number(
      (articlePanier.prix * article.quantite).toFixed(2)
    );

    const updatedOrder = await order.save();

    return res.status(200).json(updatedOrder);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Erreur lors de la modification de la commande'
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    req.order.status = req.body.status;

    await req.order.save();

    return res.status(200).json(req.order);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut de la commande'
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    let order;

    if (req.order) {
      order = req.order;
    } else {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: 'ID invalide'
        });
      }

      order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Commande non trouvée'
        });
      }

      if (
        req.user?.role === ROLES.CLIENT &&
        order.user?.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          error: 'Vous ne pouvez supprimer que vos propres commandes'
        });
      }
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