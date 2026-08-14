const express = require('express');
const upload = require('../middleware/multer');
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, updateOrderStatus } = require('../controllers/orderController');
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
router.get('/', auth, getOrders);

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
 *          404:
 *              description: Commande non trouvée
 *          500:
 *              description: Erreur lors de la récupération de la commande
 */
router.get('/:id', auth, getOrder);

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
 *              type: array
 *              items:
 *                type: object
 *                required:
 *                  - type
 *                  - id_element
 *                  - quantite
 *                properties:
 *                  type:
 *                    type: string
 *                    enum:
 *                      - Product
 *                      - Menu
 *                  id_element:
 *                    type: string
 *                  quantite:
 *                    type: number
 *      responses:
 *          201:
 *              description: Commande créée avec succès
 *          400:
 *              description: Type d'article invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, droits administrateur ou accueil requis
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
 *      responses:
 *          200:
 *              description: Modification de la commande réussie
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, droits administrateur ou accueil requis
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
 *              description: Accès interdit, droits administrateur ou accueil requis
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
