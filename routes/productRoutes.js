const express = require("express");
const upload = require("../middleware/multer")
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productcontroller");
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const ROLES = require('../config/roles');


router.get('/', getProducts); // Liste des projets
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', auth, upload.single('image'), createProduct); // Création d'un produit
router.put('/:id', auth, upload.single('image'), updateProduct); // Modification d'un produit
router.delete('/:id', auth, deleteProduct); // Suppression d'un produit


module.exports = router; 