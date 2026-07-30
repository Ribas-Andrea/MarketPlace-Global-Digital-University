const express = require("express");
const { register, login, deleteUser, updateUser } = require("../controllers/authController");
const router = express.Router();
const {body} = require('express-validator');
// const role = require('../middleware/role');


router.post('/', register); // Inscription
router.post('/login', body('username').isEmail(), login); // Connexion
router.put('/:id', updateUser); // Modifier un utilisateur
router.delete('/:id', deleteUser); // Supprimer un utilisateur


module.exports = router; 