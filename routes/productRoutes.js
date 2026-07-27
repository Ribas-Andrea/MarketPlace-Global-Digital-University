const express = require("express");
const { getProducts, getProduct, createProduct } = require("../controllers/productcontroller");
const router = express.Router();

router.get('/', getProducts); // Liste des projets
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', createProduct); // Création d'un produit

module.exports = router; 