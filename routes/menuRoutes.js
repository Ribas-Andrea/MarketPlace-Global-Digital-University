const express = require('express');
const upload = require('../middleware/multer');
const { getMenus, getMenu, createMenu, updateMenu, deleteMenu } = require('../controllers/menuController');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleMiddleware');
const ROLES = require('../config/roles');

/**
 * @swagger
 * tags:
 *  name: Menus
 *  description: Gestion des menus
 */

/**
 * @swagger
 *  /api/menus:
 *    get:
 *      summary: Afficher la liste des menus
 *      tags: [Menus]
 *      responses:
 *          200:
 *            description: Affichage des menus réussi
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    menus:
 *                      type: array
 *                      items:
 *                        type: object
 *                        properties:
 *                          _id:
 *                            type: string
 *                          imageBurger:
 *                            type: string
 *                            format: binary
 *                          nom:
 *                            type: string
 *                          prix:
 *                            type: number
 *                          categorie:
 *                            type: string
 *                          disponible:
 *                            type: boolean
 *                          options:
 *                            type: object
 *                            properties:
 *                              taille:
 *                                type: string
 *                                enum:
 *                                  - Menu Best Of
 *                                  - Menu Maxi Best Of
 *                              accompagnement:
 *                                type: string
 *                                enum:
 *                                  - Frites
 *                                  - Potatoes
 *                              boisson:
 *                                type: string
 *                              sauce:
 *                                type: string
 *                          createdAt:
 *                            type: string
 *                            format: date-time
 *                          updatedAt:
 *                            type: string
 *                            format: date-time
 *          500:
 *              description: Erreur lors de la récupération des menus
 */
router.get('/', getMenus);

/**
 * @swagger
 *  /api/menus/{id}:
 *    get:
 *      summary: Afficher le détail d'un menu
 *      tags: [Menus]
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: ID du menu
 *      responses:
 *          200:
 *            description: Menu récupéré avec succès
 *            content:
 *              application/json:
 *                schema:
 *                  type: object
 *                  properties:
 *                    menu:
 *                      type: object
 *                      properties:
 *                        _id:
 *                          type: string
 *                        imageBurger:
 *                          type: string
 *                          format: binary
 *                        nom:
 *                          type: string
 *                        prix:
 *                          type: number
 *                        categorie:
 *                          type: string
 *                        disponible:
 *                          type: boolean
 *                        options:
 *                          type: object
 *                          properties:
 *                            taille:
 *                              type: string
 *                            accompagnement:
 *                              type: string
 *                            boisson:
 *                              type: string
 *                            sauce:
 *                              type: string
 *                        createdAt:
 *                          type: string
 *                          format: date-time
 *                        updatedAt:
 *                          type: string
 *                          format: date-time
 *          400:
 *              description: ID invalide
 *          404:
 *              description: Menu non trouvé
 *          500:
 *              description: Erreur lors de la récupération du menu
 */
router.get('/:id', getMenu);

/**
 * @swagger
 *  /api/menus:
 *    post:
 *      summary: Créer un menu
 *      tags: [Menus]
 *      security:
 *          - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              required:
 *                  - imageBurger
 *                  - nom
 *                  - prix
 *                  - categorie
 *                  - disponible
 *                  - taille
 *                  - accompagnement
 *                  - boisson
 *                  - sauce
 *              properties:
 *                  imageBurger:
 *                    type: string
 *                    format: binary
 *                  nom:
 *                    type: string
 *                  prix:
 *                    type: number
 *                  categorie:
 *                    type: string
 *                  disponible:
 *                    type: boolean
 *                  taille:
 *                    type: string
 *                  accompagnement:
 *                    type: string
 *                  boisson:
 *                    type: string
 *                  sauce:
 *                    type: string
 *      responses:
 *          201:
 *              description: Menu créé avec succès
 *          400:
 *              description: Image obligatoire ou Catégorie obligatoire ou Nom obligatoire ou Prix obligatoire ou Disponibilité obligatoire ou Taille obligatoire ou Accompagnement obligatoire ou Boisson obligatoire ou Sauce obligatoire
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, droits administrateur requis
 *          500:
 *              description: Erreur lors de la création du menu
 */
router.post('/', auth, roleCheck(ROLES.ADMIN), upload.single('imageBurger'), createMenu);

/**
 * @swagger
 *  /api/menus/{id}:
 *    put:
 *      summary: Modifier un menu
 *      tags: [Menus]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID du menu
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        content:
 *          multipart/form-data:
 *            schema:
 *              type: object
 *              properties:
 *                  imageBurger:
 *                    type: string
 *                    format: binary
 *                  nom:
 *                    type: string
 *                  prix:
 *                    type: number
 *                  categorie:
 *                    type: string
 *                  disponible:
 *                    type: boolean
 *                  taille:
 *                    type: string
 *                  accompagnement:
 *                    type: string
 *                  boisson:
 *                    type: string
 *                  sauce:
 *                    type: string
 *      responses:
 *          200:
 *              description: Modification du menu réussie
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, droits administrateur requis
 *          404:
 *              description: Menu non trouvé
 *          500:
 *              description: Erreur lors de la modification du menu
 */
router.put('/:id', auth, roleCheck(ROLES.ADMIN), upload.single('imageBurger'), updateMenu);

/**
 * @swagger
 *  /api/menus/{id}:
 *    delete:
 *      summary: Supprimer un menu
 *      tags: [Menus]
 *      security:
 *          - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          description: ID du menu
 *          schema:
 *            type: string
 *      responses:
 *          200:
 *              description: Menu supprimé avec succès
 *          400:
 *              description: ID invalide
 *          401:
 *              description: Token obligatoire
 *          403:
 *              description: Accès interdit, droits administrateur requis
 *          404:
 *              description: Menu non trouvé
 *          500:
 *              description: Erreur lors de la suppression du menu
 */
router.delete('/:id', auth, roleCheck(ROLES.ADMIN), deleteMenu);

module.exports = router;
