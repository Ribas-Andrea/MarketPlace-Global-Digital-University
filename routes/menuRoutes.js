const express = require("express");
const upload = require("../middleware/multer")
const auth = require("../middleware/auth")
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require("../controllers/menuController");
const router = express.Router();

router.get('/', getMenus); // Liste des menus
router.get('/:id', getMenu); // Détail d'un menu
router.post('/', upload.single('imageBurger'), createMenu); // Création d'un menu
router.put('/:id', upload.single('imageBurger'), updateMenu); // Modification d'un menu
router.delete('/:id', deleteMenu); // Suppression d'un menu


module.exports = router; 