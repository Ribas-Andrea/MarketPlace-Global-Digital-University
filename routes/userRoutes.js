const express = require("express");
const { register, login, deleteUser, updateUser, getUsers, getUser } = require("../controllers/authController");
const router = express.Router();
const {body} = require('express-validator');
// const role = require('../middleware/role');


router.post('/', register); // Inscription
router.get('/', getUsers); // Récupérer la liste des utilisateurs
router.get('/:id', getUser); // Récupérer un utilisateur
router.post('/login', body('username').isEmail(), login); // Connexion
router.put('/:id', updateUser); // Modifier un utilisateur
router.delete('/:id', deleteUser); // Supprimer un utilisateur


module.exports = router; 