const express = require("express");
const upload = require("../middleware/multer")
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, updateOrderStatus } = require("../controllers/orderController");
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const ROLES = require('../config/roles');
const { loadOrder, validateOrderStatus, canChangeOrderStatus } = require('../middleware/statut');

router.get('/', auth, getOrders); // Liste des commandes
router.get('/:id', auth, getOrder); // Détail d'une commande
router.post('/', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), upload.none(),createOrder); // Création d'une commande
router.put('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), upload.none(), updateOrder); // Modification d'une commande
router.delete('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), deleteOrder); // Suppression d'une commande
router.patch('/:id/status',auth, upload.none(), loadOrder, validateOrderStatus, canChangeOrderStatus, updateOrderStatus)// Modification du statut d'une commande


module.exports = router; 