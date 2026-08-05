const express = require("express");
const { register, login, deleteUser, updateUser, getUsers, getUser } = require("../controllers/authController");
const router = express.Router();
const {body} = require('express-validator');
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
 *     summary: Inscription
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
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 format: string
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
 *       400:
 *         description: Authentification échouée(Email, password et role obligatoire) ou Mot de passe trop faible ou Compte déjà existant
 *       500: Erreur Serveur
*/
router.post('/', register); // Inscription

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
 *         description: Affichage des utilisateurs réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                type: object
 *                properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                     type: string
 *                     format: email
 *                 role:
 *                     type: string
 *                 createdAt:
 *                     type: string
 *                     format: date-time
 *                 updatedAt:
 *                     type: string
 *                     format: date-time
 *                 token:
 *                   type: string
 *       500:
 *         description: Erreur lors de la récupération des utilisateurs
 */
router.get('/', auth, roleCheck(ROLES.ADMIN), getUsers); // Récupérer la liste des utilisateurs

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
 *         description: Affichage des utilisateurs réussie
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                     type: string
 *                     format: email
 *                 role:
 *                     type: string
 *                 createdAt:
 *                     type: string
 *                     format: date-time
 *                 updatedAt:
 *                     type: string
 *                     format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: ID invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la récupération de l'utilisateur
 */
router.get('/:id', auth, roleCheck(ROLES.ADMIN), getUser); // Récupérer un utilisateur

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion
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
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 format: string
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
 *       400:
 *         description: Email, password et role obligatoire ou Identifiant Invalides
 *       500: 
 *         description: Erreur Serveur
 */
router.post('/login', body('username').isEmail(), login); // Connexion

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
 *             required:
 *               - password
 *               - role
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 format: string
 *     responses:
 *       200:
 *         description: Modification de l'utilisateur réussie
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                     type: string
 *                     format: email
 *                 password:
 *                     type: string
 *                     format: password
 *                 role:
 *                     type: string
 *                 createdAt:
 *                     type: string
 *                     format: date-time
 *                 updatedAt:
 *                     type: string
 *                     format: date-time
 *                 token:
 *                   type: string
 *       400:
 *         description: ID invalide ou Rôle invalide
 *       404:
 *         description: Utilisateur non trouvé
 *       403:
 *         description: Modification du nom d'utilisateur interdite
 *       500:
 *         description: Erreur lors de la modification de l'utilisateur
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN), updateUser); // Modifier un utilisateur

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
 *         description: Supression de l'utilisateur réussie
 *       400:
 *         description: ID invalide
 *       403:
 *         description: Modification du nom d'utilisateur interdite(Oh le petit malin !!!)
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur lors de la suppression de l'utilisateur
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteUser); // Supprimer un utilisateur

module.exports = router; 