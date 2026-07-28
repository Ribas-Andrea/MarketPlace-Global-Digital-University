const express = require("express");
const upload = require("../middleware/multer")
const { getProducts, getProduct, createProduct, modifyProducts, deleteProducts } = require("../controllers/productcontroller");
const router = express.Router();

router.get('/', getProducts); // Liste des projets
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', upload.single('image'), createProduct); // Création d'un produit
router.put('/:id', modifyProducts); // Modification d'un produit
router.delete('/:id', deleteProducts); // Suppression d'un produit


module.exports = router; 