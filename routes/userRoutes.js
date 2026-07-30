const express = require("express");
const { register, login } = require("../controllers/authController");
const router = express.Router();
const {body} = require('express-validator');
// const role = require('../middleware/role');


router.post('/', register); // Inscription
router.post('/login', body('username').isEmail(), login); // Connexion
// router.get('/login', role, getlogin);

module.exports = router; 