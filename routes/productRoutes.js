const express = require("express");
const upload = require("../middleware/multer")
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require("../controllers/productcontroller");
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');


/**@swagger
 * tags:
 *  name: Produits
 *  description: Gestion des produits
 */

router.get('/',  getProducts); // Liste des produits
router.get('/:id', getProduct); // Détail d'un produit
router.post('/', auth,  roleCheck(ROLES.ADMIN), upload.single('image'), createProduct); // Création d'un produit


/**
 * @swagger
 *  /api/products:
 *    post:
 *      summary: Créer un nouveau produit
 *      tags: [Produits]
 *      security: 
 *          - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              required:
 *                  -nom
 *                  -image
 *                  -prix
 *                  -categorie
 *                  -disponible
 *              properties:
 *                  image:
 *                    type: string
 *                    format: binary
 *                  nom:
 *                    type: string
 *                  prix:
 *                    type: number
 *                  categorie:
 *                    type: string
 *                  disponible:
 *                    type: boolean
 *      responses:
 *          201:
 *              description: Produit créé
 *          400:
 *              description: Nom obligatoire ou image obligatoire
 *          401:
 *              description: Token obligatoire
 */


router.put('/:id', auth,  roleCheck(ROLES.ADMIN), upload.single('image'), updateProduct); // Modification d'un produit
router.delete('/:id', auth,  roleCheck(ROLES.ADMIN), deleteProduct); // Suppression d'un produit


module.exports = router; 