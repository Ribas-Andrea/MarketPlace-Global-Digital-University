const express = require('express');
const { register, login, deleteUser, updateUser, getUsers, getUser } = require('../controllers/authController');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

/**
 * @swagger
 * tags:
 *    name: Users
 *    description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Inscription d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   enum:
 *                     - administrateur
 *                     - accueil
 *                     - preparateur
 *                     - client
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Email et password obligatoires, mot de passe trop faible ou compte déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/', body('username').isEmail().withMessage('Le username doit être une adresse email'), register);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Afficher la liste des utilisateurs
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                         format: email
 *                       role:
 *                         type: string
 *                         enum:
 *                           - administrateur
 *                           - accueil
 *                           - preparateur
 *                           - client
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
 *         description: Erreur lors de la récupération des utilisateurs
 */
router.get('/', auth, roleCheck(ROLES.ADMIN), getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Afficher un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum:
 *                         - administrateur
 *                         - accueil
 *                         - preparateur
 *                         - client
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès non autorisé pour votre rôle
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la récupération de l'utilisateur
 */
router.get('/:id', auth, roleCheck(ROLES.ADMIN), getUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum:
 *                         - administrateur
 *                         - accueil
 *                         - preparateur
 *                         - client
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Email, password obligatoires ou identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', body('username').isEmail(), login);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum:
 *                   - administrateur
 *                   - accueil
 *                   - preparateur
 *                   - client
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                   format: email
 *                 role:
 *                   type: string
 *                   enum:
 *                     - administrateur
 *                     - accueil
 *                     - preparateur
 *                     - client
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: ID invalide ou rôle invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Modification du nom d'utilisateur interdite ou accès non autorisé pour votre rôle
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la modification de l'utilisateur
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       400:
 *         description: ID invalide
 *       401:
 *         description: Token obligatoire
 *       403:
 *         description: Accès non autorisé pour votre rôle
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression de l'utilisateur
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteUser);

module.exports = router;
