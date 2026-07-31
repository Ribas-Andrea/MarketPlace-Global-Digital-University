const express = require("express");
const upload = require("../middleware/multer")
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require("../controllers/menuController");
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const ROLES = require('../config/roles');

router.get('/', getMenus); // Liste des menus
router.get('/:id', getMenu); // Détail d'un menu
router.post('/', auth, roleCheck(ROLES.ADMIN), upload.single('imageBurger'), createMenu); // Création d'un menu
router.put('/:id', auth, roleCheck(ROLES.ADMIN), upload.single('imageBurger'), updateMenu); // Modification d'un menu
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteMenu); // Suppression d'un menu


module.exports = router; 