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
 *     description: Retourne toutes les commandes. Accès réservé aux administrateurs et au personnel d'accueil.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des commandes récupérée avec succès
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
 *     description: Retourne uniquement les commandes dont le statut est "en_attente", triées par heure de livraison croissante.
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
 *     description: |
 *       Permet de retrouver une commande à partir de son numéro.
 *       Un utilisateur non authentifié doit fournir le code de commande
 *       dans l'en-tête codeCommande.
 *       Un utilisateur authentifié accède à la commande selon son rôle.
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: numeroCommande
 *         required: true
 *         description: Numéro de commande
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 125
 *       - in: header
 *         name: codeCommande
 *         required: false
 *         description: Code secret de la commande, obligatoire pour un utilisateur non authentifié
 *         schema:
 *           type: string
 *           example: "5837"
 *     responses:
 *       200:
 *         description: Commande récupérée avec succès
 *       400:
 *         description: Numéro de commande invalide
 *       401:
 *         description: Code de commande obligatoire
 *       403:
 *         description: Code de commande incorrect ou accès interdit
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
 *     description: Retourne une commande à partir de son identifiant MongoDB.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID MongoDB de la commande
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
 * /api/orders:
 *   post:
 *     summary: Créer une commande
 *     description: Crée une commande. L'utilisateur peut être authentifié ou non. Une commande créée sans authentification reçoit un code secret permettant de la retrouver.Un produit indisponible ne peut pas être ajouter à une commande.
 *     tags: [Commandes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - heureLivraison
 *               - articles
 *             properties:
 *               heureLivraison:
 *                 type: string
 *                 description: Heure souhaitée pour la livraison
 *                 example: "12:30"
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
 *                       description: Identifiant MongoDB du produit ou du menu
 *                       example: "64f123456789abcdef123456"
 *                     quantite:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *       400:
 *         description: Données de commande invalides ou produit indisponible
 *       403:
 *         description: Les préparateurs ne peuvent pas créer de commande
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
 *     description: Modifie le type, l'article ou la quantité d'un article existant dans une commande.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID MongoDB de la commande
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
 *                 description: Type du nouvel article
 *                 example: Product
 *               id_element:
 *                 type: string
 *                 description: Identifiant MongoDB du nouvel article
 *                 example: "64f123456789abcdef123456"
 *               quantite:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nouvelle quantité de l'article
 *                 example: 2
 *     responses:
 *       200:
 *         description: Commande modifiée avec succès
 *       400:
 *         description: Données invalides ou identifiant invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Modification interdite pour ce rôle ou cette commande
 *       404:
 *         description: Commande ou article non trouvé
 *       500:
 *         description: Erreur lors de la modification de la commande
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), upload.none(), updateOrder);

/**
 * @swagger
 * /api/orders/numero/{numeroCommande}:
 *   put:
 *     summary: Modifier un article d'une commande avec son numéro
 *     description: |
 *       Permet de modifier un article d'une commande à partir de son numéro.
 *       Un utilisateur non authentifié doit fournir le code de commande
 *       dans l'en-tête codeCommande.
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: numeroCommande
 *         required: true
 *         description: Numéro de commande
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 125
 *       - in: header
 *         name: codeCommande
 *         required: false
 *         description: Code secret de la commande, obligatoire pour un utilisateur non authentifié
 *         schema:
 *           type: string
 *           example: "5837"
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
 *                 description: Type du nouvel article
 *                 example: Product
 *               id_element:
 *                 type: string
 *                 description: Identifiant MongoDB du nouvel article
 *                 example: "64f123456789abcdef123456"
 *               quantite:
 *                 type: integer
 *                 minimum: 1
 *                 description: Nouvelle quantité de l'article
 *                 example: 2
 *     responses:
 *       200:
 *         description: Commande modifiée avec succès
 *       400:
 *         description: Données invalides ou identifiant invalide ou produit indisponible
 *       403:
 *         description: Code de commande incorrect ou accès interdit
 *       404:
 *         description: Commande ou article non trouvé
 *       500:
 *         description: Erreur lors de la modification de la commande
 */
router.put('/numero/:numeroCommande', optionalAuth, orderAccess, updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Supprimer une commande
 *     description: Supprime une commande à partir de son identifiant MongoDB.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID MongoDB de la commande
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
 *         description: Suppression interdite pour ce rôle ou cette commande
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la suppression de la commande
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL, ROLES.CLIENT), deleteOrder);

/**
 * @swagger
 * /api/orders/numero/{numeroCommande}:
 *   delete:
 *     summary: Supprimer une commande avec son numéro
 *     description: |
 *       Permet de supprimer une commande à partir de son numéro.
 *       Un utilisateur non authentifié doit fournir le code de commande
 *       dans l'en-tête codeCommande.
 *     tags: [Commandes]
 *     parameters:
 *       - in: path
 *         name: numeroCommande
 *         required: true
 *         description: Numéro de commande
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 125
 *       - in: header
 *         name: codeCommande
 *         required: false
 *         description: Code secret de la commande, obligatoire pour un utilisateur non authentifié
 *         schema:
 *           type: string
 *           example: "5837"
 *     responses:
 *       200:
 *         description: Commande supprimée avec succès
 *       400:
 *         description: Numéro de commande invalide
 *       403:
 *         description: Code de commande incorrect ou accès interdit
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la suppression de la commande
 */
router.delete('/numero/:numeroCommande', optionalAuth, orderAccess, deleteOrder);

/**
 * @swagger
 * /api/orders/status/{id}:
 *   patch:
 *     summary: Modifier le statut d'une commande
 *     description: Modifie le statut d'une commande selon les droits du rôle de l'utilisateur.
 *     tags: [Commandes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID MongoDB de la commande
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
 *                 example: preparee
 *                 description: Nouveau statut de la commande
 *     responses:
 *       200:
 *         description: Statut de la commande mis à jour avec succès
 *       400:
 *         description: ID ou statut invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Vous n'avez pas les droits pour modifier ce statut
 *       404:
 *         description: Commande non trouvée
 *       500:
 *         description: Erreur lors de la mise à jour du statut de la commande
 */
router.patch('/status/:id', auth, upload.none(), loadOrder, validateOrderStatus, canChangeOrderStatus, updateOrderStatus);

module.exports = router;
