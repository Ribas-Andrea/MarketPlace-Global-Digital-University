const express = require("express");
const upload = require("../middleware/multer")
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productcontroller");
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');


router.get('/',  getProducts); // Liste des produits
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', auth,  roleCheck(ROLES.ADMIN), upload.single('image'), createProduct); // Création d'un produit
router.put('/:id', auth,  roleCheck(ROLES.ADMIN), upload.single('image'), updateProduct); // Modification d'un produit
router.delete('/:id', auth,  roleCheck(ROLES.ADMIN), deleteProduct); // Suppression d'un produit


module.exports = router; 