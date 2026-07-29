const express = require("express");
const upload = require("../middleware/multer")
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder } = require("../controllers/orderController");
const router = express.Router();

router.get('/', getOrders); // Liste des commandes
router.get('/:id', getOrder); // Détail d'une commande
router.post('/', upload.none(),createOrder); // Création d'une commande
router.put('/:id', upload.none(), updateOrder); // Modification d'une commande
router.delete('/:id', deleteOrder); // Suppression d'une commande


module.exports = router; 