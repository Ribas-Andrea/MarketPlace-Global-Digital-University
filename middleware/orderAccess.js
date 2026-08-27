const Order = require('../models/order');
const ROLES = require('../config/roles');

const orderAccess = async (req, res, next) => {
  try {
    const { numeroCommande } = req.params;

    if (
      !Number.isInteger(Number(numeroCommande)) ||
      Number(numeroCommande) <= 0
    ) {
      return res.status(400).json({
        error: 'Numéro de commande invalide'
      });
    }

    const order = await Order.findOne({
      numeroCommande: Number(numeroCommande)
    }).select('+codeCommande');

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    if (req.user) {
      if (req.user.role === ROLES.CLIENT) {
        if (
          !order.user ||
          order.user.toString() !== req.user.userId
        ) {
          return res.status(403).json({
            error: 'Vous ne pouvez accéder qu’à vos propres commandes'
          });
        }
      } else if (
        req.user.role !== ROLES.ADMIN &&
        req.user.role !== ROLES.ACCUEIL
      ) {
        return res.status(403).json({
          error: 'Vous n’êtes pas autorisé à modifier ou supprimer cette commande'
        });
      }

      req.order = order;
      return next();
    }

    const codeCommande =
      req.headers['codecommande'] || req.body?.codeCommande;

    if (!codeCommande) {
      return res.status(401).json({
        error: 'Code de commande obligatoire'
      });
    }

    if (order.codeCommande !== codeCommande.toString()) {
      return res.status(403).json({
        error: 'Code de commande incorrect'
      });
    }

    req.order = order;

    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Erreur lors de la vérification de la commande'
    });
  }
};

module.exports = orderAccess;