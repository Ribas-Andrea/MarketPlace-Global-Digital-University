const Order = require('../models/order');
const { STATUS, permissionsStatus } = require('../config/statuts');

async function loadOrder(req, res, next) {
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
        error: 'Commande introuvable'
      });
    }

    req.order = order;

    next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: 'Erreur lors de la récupération de la commande'
    });
  }
}

function validateOrderStatus(req, res, next) {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Le statut de la commande est requis' });
  }

  const validStatus = Object.values(STATUS);
  if (!validStatus.includes(status)) {
    return res.status(400).json({ error: `Statut invalide. Valeurs possibles : ${validStatus.join(', ')}` });
  }

  next();
}

function canChangeOrderStatus(req, res, next) {
  const { role } = req.user;
  const order = req.order;
  const { status: newStatus } = req.body;

  if (role === 'administrateur') return next();

  const rolePermissions = permissionsStatus[role];
  if (!rolePermissions) {
    return res.status(403).json({ error: 'Rôle non reconnu' });
  }

  const allowedTransitions = rolePermissions[order.status] || [];

  if (!allowedTransitions.includes(newStatus)) {
    return res.status(403).json({
      error: `Le rôle '${role}' ne peut pas faire passer une commande de '${order.status}' à '${newStatus}'`
    });
  }

  next();
}

module.exports = { loadOrder, validateOrderStatus, canChangeOrderStatus };
