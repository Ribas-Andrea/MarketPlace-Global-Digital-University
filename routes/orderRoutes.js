const express = require('express');
const upload = require('../middleware/multer');
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, updateOrderStatus, getOrdersPreparateur, getOrderByNumero } = require('../controllers/orderController');
const router = express.Router();
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
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
 * /api/orders:
 *   get:
 *     summary: Afficher la liste des commandes
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Affichage des commandes réussi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "68a123456789abcdef123456"
 *                       numeroCommande:
 *                         type: integer
 *                         example: 125
 *                       user:
 *                         type: string
 *                         nullable: true
 *                         description: ID de l'utilisateur si la commande est associée à un compte
 *                       articles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               enum:
 *                                 - Product
 *                                 - Menu
 *                             id_element:
 *                               type: string
 *                             quantite:
 *                               type: integer
 *                               minimum: 1
 *                             totalArticle:
 *                               type: number
 *                               example: 21.50
 *                       status:
 *                         type: string
 *                         enum:
 *                           - brouillon
 *                           - en_attente
 *                           - preparee
 *                           - livree
 *                       heureLivraison:
 *                         type: string
 *                         pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                         example: "12:30"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès non autorisé pour votre rôle
 *       500:
 *         description: Erreur lors de la récupération des commandes
 */
router.get('/', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), getOrders);

/**
 * @swagger
 * /api/orders/preparateur:
 *   get:
 *     summary: Afficher les commandes à préparer
 *     description: Retourne uniquement les commandes en attente, triées par heure de livraison croissante.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes à préparer récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       numeroCommande:
 *                         type: integer
 *                         example: 125
 *                       user:
 *                         type: string
 *                         nullable: true
 *                       articles:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             type:
 *                               type: string
 *                               enum:
 *                                 - Product
 *                                 - Menu
 *                             id_element:
 *                               type: string
 *                             quantite:
 *                               type: integer
 *                               minimum: 1
 *                             totalArticle:
 *                               type: number
 *                       status:
 *                         type: string
 *                         enum:
 *                           - en_attente
 *                       heureLivraison:
 *                         type: string
 *                         pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                         example: "12:30"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
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
 * /api/orders/numero/{numeroCommande}:
 *   get:
 *     summary: Afficher une commande avec son numéro
 *     description: Permet à un client non authentifié de retrouver une commande créée depuis une borne.
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: numeroCommande
 *         required: true
 *         description: Numéro de commande affiché au client
 *         schema:
 *           type: integer
 *           example: 125
 *     responses:
 *       200:
 *         description: Commande récupérée avec succès
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la récupération de la commande
 */
router.get('/numero/:numeroCommande', getOrderByNumero);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Afficher le détail d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la commande
 *         schema:
 *           type: string
 *           example: "68a123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Commande récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 numeroCommande:
 *                   type: integer
 *                   example: 125
 *                 user:
 *                   type: string
 *                   nullable: true
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum:
 *                     - brouillon
 *                     - en_attente
 *                     - preparee
 *                     - livree
 *                 heureLivraison:
 *                   type: string
 *                   pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                   example: "12:30"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès interdit à cette commande
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la récupération de la commande
 */
router.get('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.PREPARATEUR, ROLES.CLIENT), getOrder);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Créer une commande
 *     description: Permet de créer une commande depuis une borne sans authentification.
 *     tags: [Commandes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articles
 *               - heureLivraison
 *             properties:
 *               articles:
 *                 type: array
 *                 minItems: 1
 *                 description: Liste des produits et menus de la commande
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - id_element
 *                     - quantite
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum:
 *                         - Product
 *                         - Menu
 *                       example: Product
 *                     id_element:
 *                       type: string
 *                       example: "6a6b442e279ded257bfe5c98"
 *                     quantite:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *               heureLivraison:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 example: "12:30"
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 numeroCommande:
 *                   type: integer
 *                   example: 125
 *                 user:
 *                   type: string
 *                   nullable: true
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum:
 *                     - brouillon
 *                     - en_attente
 *                     - preparee
 *                     - livree
 *                 heureLivraison:
 *                   type: string
 *                   example: "12:30"
 *       400:
 *         description: La commande doit contenir au moins un article ou le type d'article est invalide
 *       404:
 *         description: Article non trouvé
 *       500:
 *         description: Erreur lors de la création de la commande
 */
router.post('/', optionalAuth, upload.none(), createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Modifier un article d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la commande
 *         schema:
 *           type: string
 *           example: "68a123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_element
 *             properties:
 *               type:
 *                 type: string
 *                 enum:
 *                   - Product
 *                   - Menu
 *                 example: Product
 *               id_element:
 *                 type: string
 *                 description: ID de l'article à modifier dans la commande
 *                 example: "6a6b442e279ded257bfe5c98"
 *               quantite:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nouvelle quantité de l'article
 *                 example: 3
 *     responses:
 *       200:
 *         description: Modification de la commande réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 numeroCommande:
 *                   type: integer
 *                   example: 125
 *                 user:
 *                   type: string
 *                   nullable: true
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum:
 *                     - brouillon
 *                     - en_attente
 *                     - preparee
 *                     - livree
 *                 heureLivraison:
 *                   type: string
 *                   pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                   example: "12:30"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Rôle non autorisé ou commande appartenant à un autre client
 *       404:
 *         description: Commande ou article non trouvé
 *       500:
 *         description: Erreur lors de la modification de la commande
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), upload.none(), updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Supprimer une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la commande
 *         schema:
 *           type: string
 *           example: "68a123456789abcdef123456"
 *     responses:
 *       200:
 *         description: Commande supprimée avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Rôle non autorisé ou commande appartenant à un autre client
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la suppression de la commande
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), deleteOrder);

/**
 * @swagger
 * /api/orders/status/{id}:
 *   patch:
 *     summary: Modifier le statut d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la commande
 *         schema:
 *           type: string
 *           example: "68a123456789abcdef123456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - brouillon
 *                   - en_attente
 *                   - preparee
 *                   - livree
 *                 example: "preparee"
 *     responses:
 *       200:
 *         description: Statut de la commande modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 numeroCommande:
 *                   type: integer
 *                   example: 125
 *                 user:
 *                   type: string
 *                   nullable: true
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 *                   enum:
 *                     - brouillon
 *                     - en_attente
 *                     - preparee
 *                     - livree
 *                 heureLivraison:
 *                   type: string
 *                   pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                   example: "12:30"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Le statut de la commande est requis ou le statut est invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Rôle non reconnu ou transition de statut non autorisée
 *       404:
 *         description: Commande introuvable
 *       500:
 *         description: Erreur lors de la mise à jour du statut de la commande
 */
router.patch('/status/:id', auth, upload.none(), loadOrder, validateOrderStatus, canChangeOrderStatus, updateOrderStatus);

module.exports = router;
