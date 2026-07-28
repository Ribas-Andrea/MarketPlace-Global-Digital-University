const express = require("express");
const upload = require("../middleware/multer")
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productcontroller");
const router = express.Router();

router.get('/', getProducts); // Liste des projets
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', upload.single('image'), createProduct); // Création d'un produit
router.put('/:id', upload.single('image'), updateProduct); // Modification d'un produit
router.delete('/:id', deleteProduct); // Suppression d'un produit


module.exports = router; 