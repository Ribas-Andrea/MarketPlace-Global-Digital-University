const express = require('express');
const upload = require('../middleware/multer');
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, updateOrderStatus, getOrdersPreparateur } = require('../controllers/orderController');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');
const { loadOrder, validateOrderStatus, canChangeOrderStatus } = require('../middleware/statutMiddleware');

/**
 * @swagger
 * tags:
 *  name: Commandes
 *  description: Gestion des commandes
 */

/**
 * @swagger
 *  /api/orders:
 *    get:
 *      summary: Afficher la liste des commandes
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      responses:
 *          200:
 *            description: Affichage des commandes réussi
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    orders:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                          user:
 *                            type: string
 *                          articles:
 *                            type: array
 *                            items:
 *                              type: object
 *                              properties:
 *                                type:
 *                                  type: string
 *                                  enum:
 *                                    - Product
 *                                    - Menu
 *                                id_element:
 *                                  type: string
 *                                quantite:
 *                                  type: number
 *                                totalArticle:
 *                                  type: number
 *                          status:
 *                            type: string
 *                            enum:
 *                              - brouillon
 *                              - en_attente
 *                              - preparee
 *                              - livree
 *                          heureLivraison:
 *                            type: string
 *                            format: date-time
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                          updatedAt:
 *                            type: string
 *                            format: date-time
 *          401:
 *              description: Token obligatoire
 *          500:
 *              description: Erreur lors de la récupération des commandes
 */
router.get('/', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), getOrders);

/**
 * @swagger
 * /api/orders/preparateur:
 *   get:
 *     summary: Afficher les commandes à préparer
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes à préparer triées par heure de livraison croissante
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès réservé aux administrateurs et aux préparateurs
 *       500:
 *         description: Erreur lors de la récupération des commandes à préparer
 */
router.get('/preparateur', auth, roleCheck(ROLES.ADMIN,ROLES.PREPARATEUR), getOrdersPreparateur);

/**
 * @swagger
 *  /api/orders/{id}:
 *    get:
 *      summary: Afficher le détail d'une commande
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID de la commande
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *            description: Commande récupérée avec succès
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit à cette commande
 *          404:
 *              description: Commande non trouvée
 *          500:
 *              description: Erreur lors de la récupération de la commande
 */
router.get('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.PREPARATEUR, ROLES.CLIENT), getOrder);

/**
 * @swagger
 *  /api/orders:
 *    post:
 *      summary: Créer une commande
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - articles
 *                - heureLivraison
 *              properties:
 *                articles:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - type
 *                      - id_element
 *                      - quantite
 *                    properties:
 *                      type:
 *                        type: string
 *                        enum:
 *                          - Product
 *                          - Menu
 *                      id_element:
 *                        type: string
 *                      quantite:
 *                        type: number
 *                        minimum: 1
 *                heureLivraison:
 *                  type: string
 *                  format: date-time
 *      responses:
 *          201:
 *              description: Commande créée avec succès
 *          400:
 *              description: Type d'article invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, rôle non autorisé
 *          404:
 *              description: Article non trouvé
 *          500:
 *              description: Erreur lors de la création de la commande
 */
router.post('/', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), upload.none(), createOrder);

/**
 * @swagger
 *  /api/orders/{id}:
 *    put:
 *      summary: Modifier une commande
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID de la commande
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - id_element
 *              properties:
 *                type:
 *                  type: string
 *                  enum:
 *                    - Product
 *                    - Menu
 *                id_element:
 *                  type: string
 *                quantite:
 *                  type: number
 *                  minimum: 1
 *      responses:
 *          200:
 *              description: Modification de la commande réussie
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Rôle non autorisé ou commande appartenant à un autre client
 *          404:
 *              description: Commande ou article non trouvé
 *          500:
 *              description: Erreur lors de la modification de la commande
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), upload.none(), updateOrder);

/**
 * @swagger
 *  /api/orders/{id}:
 *    delete:
 *      summary: Supprimer une commande
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID de la commande
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *              description: Commande supprimée avec succès
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Rôle non autorisé
 *          404:
 *              description: Commande non trouvée
 *          500:
 *              description: Erreur lors de la suppression de la commande
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), deleteOrder);

/**
 * @swagger
 *  /api/orders/status/{id}:
 *    patch:
 *      summary: Modifier le statut d'une commande
 *      tags: [Commandes]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID de la commande
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - status
 *              properties:
 *                status:
 *                  type: string
 *                  enum:
 *                    - brouillon
 *                    - en_attente
 *                    - preparee
 *                    - livree
 *      responses:
 *          200:
 *            description: Statut de la commande modifié avec succès
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                    user:
 *                      type: string
 *                    articles:
 *                      type: array
 *                      items:
 *                        type: object
 *                    status:
 *                      type: string
 *                      enum:
 *                        - brouillon
 *                        - en_attente
 *                        - preparee
 *                        - livree
 *                    heureLivraison:
 *                      type: string
 *                      format: date-time
 *                    createdAt:
 *                      type: string
 *                      format: date-time
 *                    updatedAt:
 *                      type: string
 *                      format: date-time
 *          400:
 *              description: Le statut de la commande est requis ou le statut est invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Rôle non reconnu ou transition de statut non autorisée
 *          404:
 *              description: Commande introuvable
 *          500:
 *              description: Erreur lors de la mise à jour du statut de la commande
 */
router.patch('/status/:id', auth, upload.none(), loadOrder, validateOrderStatus, canChangeOrderStatus, updateOrderStatus);

module.exports = router;
