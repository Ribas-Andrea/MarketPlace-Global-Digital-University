const express = require("express");
const { register, login, deleteUser, updateUser, getUsers, getUser } = require("../controllers/authController");
const router = express.Router();
const {body} = require('express-validator');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const ROLES = require('../config/roles');

router.post('/', register); // Inscription
router.get('/', auth, roleCheck(ROLES.ADMIN), getUsers); // Récupérer la liste des utilisateurs
router.get('/:id', auth, roleCheck(ROLES.ADMIN, ROLES.ACCUEIL), getUser); // Récupérer un utilisateur
router.post('/login', body('username').isEmail(), login); // Connexion
router.put('/:id', auth, roleCheck(ROLES.ADMIN), updateUser); // Modifier un utilisateur
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteUser); // Supprimer un utilisateur


module.exports = router; 