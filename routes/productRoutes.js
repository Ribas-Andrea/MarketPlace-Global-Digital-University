const express = require('express');
const upload = require('../middleware/multer');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

/**
 * @swagger
 * tags:
 *  name: Produits
 *  description: Gestion des produits
 */

/**
 * @swagger
 *  /api/products:
 *    get:
 *      summary: Afficher la liste des produits
 *      tags: [Produits]
 *      responses:
 *          200:
 *            description: Affichage des produits réussie
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      image:
 *                        type: string
 *                        format: binary
 *                      nom:
 *                        type: string
 *                      prix:
 *                        type: number
 *                      categorie:
 *                        type: string
 *                      disponible:
 *                        type: boolean
 *                      createdAt:
 *                        type: string
 *                        format: date-time
 *                      updatedAt:
 *                        type: string
 *                        format: date-time
 *          500:
 *              description: Erreur lors de la récupération des produits
 */
router.get('/', getProducts);

/**
 * @swagger
 *  /api/products/{id}:
 *    get:
 *      summary: Afficher un produit
 *      tags: [Produits]
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit
 *         schema:
 *           type: string
 *      responses:
 *          200:
 *            description: Affichage du produit réussie
 *            content:
 *              application/json:
 *                schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                      image:
 *                        type: string
 *                        format: binary
 *                      nom:
 *                        type: string
 *                      prix:
 *                        type: number
 *                      categorie:
 *                        type: string
 *                      disponible:
 *                        type: boolean
 *                      createdAt:
 *                        type: string
 *                        format: date-time
 *                      updatedAt:
 *                        type: string
 *                        format: date-time
 *          400:
 *              description: ID invalide
 *          404:
 *              description: Produit non trouvé
 *          500:
 *              description: Erreur lors de la création du produit
 */
router.get('/:id', getProduct);

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
 *                  createdAt:
 *                    type: string
 *                    format: date-time
 *                  updatedAt:
 *                    type: string
 *                    format: date-time
 *      responses:
 *          201:
 *              description: Produit créé
 *          400:
 *              description: Nom obligatoire ou image obligatoire ou Catégorie obligatoire ou Prix obligatoire ou Disponibilité obligatoire
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès non autorisé pour votre rôle
 *          500:
 *              description: Erreur lors de la création du produit
 */
router.post('/', auth, roleCheck(ROLES.ADMIN), upload.single('image'), createProduct);

/**
 * @swagger
 *  /api/products/{id}:
 *    put:
 *      summary: Modifier un produit
 *      tags: [Produits]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit
 *         schema:
 *           type: string
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
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
 *          200:
 *            description: Modification de l'utilisateur réussie
 *            content:
 *              application/json:
 *                schema:
 *                    type: object
 *                    properties:
 *                      image:
 *                        type: string
 *                        format: binary
 *                      nom:
 *                        type: string
 *                      prix:
 *                        type: number
 *                      categorie:
 *                       type: string
 *                      disponible:
 *                        type: boolean
 *                      createdAt:
 *                        type: string
 *                        format: date-time
 *                      updatedAt:
 *                        type: string
 *                        format: date-time
 *                      token:
 *                        type: string
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès non autorisé pour votre rôle
 *          404:
 *              description: Produit non trouvé
 *          500:
 *              description: Erreur lors de la modification du produit
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN), upload.single('image'), updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du produit
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *       400:
 *         description: ID invalide
 *       403:
 *         description: Suppression du produit interdite(Oh le petit malin !!!) ou Accès non autorisé pour votre rôle
 *       404:
 *         description: Produit non trouvé
 *       500:
 *         description: Erreur lors de la suppression du produit
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteProduct);

module.exports = router;
