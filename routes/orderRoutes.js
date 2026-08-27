const express = require('express');
const upload = require('../middleware/multer');
const { getOrders, getOrder, createOrder, updateOrder, deleteOrder, updateOrderStatus, getOrdersPreparateur, getOrderByNumero } = require('../controllers/orderController');

const router = express.Router();

const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

const { loadOrder, validateOrderStatus, canChangeOrderStatus } = require('../middleware/statutMiddleware');

const orderAccess = require('../middleware/orderAccess');


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
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès réservé aux administrateurs et aux préparateurs
 *       500:
 *         description: Erreur lors de la récupération des commandes à préparer
 */
router.get('/preparateur', auth, roleCheck(ROLES.ADMIN, ROLES.PREPARATEUR), getOrdersPreparateur);

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
router.get('/numero/:numeroCommande', optionalAuth, orderAccess, getOrderByNumero);

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
 *              required:
 *                - heureLivraison
 *              items:
 *                type: object
 *                required:
 *                  - type
 *                  - id_element
 *                  - quantite
 *                properties:
 *                  heureLivraison : 
 *                    type: string
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
router.post('/', optionalAuth, upload.none(), createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Modifier un article d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), upload.none(), updateOrder);

/**
 * @swagger
 * /api/orders/numero/{numeroCommande}:
 *   put:
 *     summary: Modifier un article d'une commande avec le numéro et le code secret
 *     description: Permet à un client non authentifié de modifier sa commande avec son numéro de commande et son code secret.
 *     tags: [Commandes]
 */
router.put('/numero/:numeroCommande', optionalAuth, upload.none(), orderAccess, updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Supprimer une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), deleteOrder);

/**
 * @swagger
 * /api/orders/numero/{numeroCommande}:
 *   delete:
 *     summary: Supprimer une commande avec le numéro et le code secret
 *     description: Permet à un client non authentifié de supprimer sa commande avec son numéro et son code secret.
 *     tags: [Commandes]
 */
router.delete('/numero/:numeroCommande', optionalAuth, upload.none(), orderAccess, deleteOrder);

/**
 * @swagger
 * /api/orders/status/{id}:
 *   patch:
 *     summary: Modifier le statut d'une commande
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/status/:id', auth, upload.none(), loadOrder, validateOrderStatus, canChangeOrderStatus, updateOrderStatus);

module.exports = router;
