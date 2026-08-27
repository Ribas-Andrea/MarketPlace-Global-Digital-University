const Menu = require('../models/menu');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.find();

    res.status(200).json({ menus });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des menus'
    });
  }
};

exports.getMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        error: 'Menu non trouvé'
      });
    }

    res.status(200).json({ menu });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération du menu'
    });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { nom, prix, categorie, disponible, taille, accompagnement, boisson, sauce } = req.body;

    if (!req.file) {
      return res.status(400).json({
        error: 'Image obligatoire'
      });
    }

    if (!nom) {
      return res.status(400).json({
        error: 'Nom obligatoire'
      });
    }

    if (prix === undefined || prix === null || prix === '' || isNaN(prix) || Number(prix) <= 0) {
      return res.status(400).json({
        error: 'Prix invalide'
      });
    }

    if (!categorie) {
      return res.status(400).json({
        error: 'Catégorie obligatoire'
      });
    }

    if (disponible === undefined) {
      return res.status(400).json({
        error: 'Disponibilité obligatoire'
      });
    }

    if (!taille) {
      return res.status(400).json({
        error: 'Taille obligatoire'
      });
    }

    if (!accompagnement) {
      return res.status(400).json({
        error: 'Accompagnement obligatoire'
      });
    }

    if (!boisson) {
      return res.status(400).json({
        error: 'Boisson obligatoire'
      });
    }

    if (!sauce) {
      return res.status(400).json({
        error: 'Sauce obligatoire'
      });
    }

    let imageBurger;

    if (process.env.NODE_ENV === 'production') {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `menus/${categorie}`
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });

      imageBurger = result.secure_url;
    } else {
      const dossier = `uploads/${categorie}`;

      if (!fs.existsSync(dossier)) {
        fs.mkdirSync(dossier, { recursive: true });
      }

      const nouveauChemin = path.join(dossier, req.file.filename);

      fs.renameSync(req.file.path, nouveauChemin);

      imageBurger = `${categorie}/${req.file.filename}`;
    }

    const menu = new Menu({
      imageBurger,
      nom,
      prix,
      categorie,
      disponible,
      options: {
        taille,
        accompagnement,
        boisson,
        sauce
      }
    });

    const savedMenu = await menu.save();

    res.status(201).json(savedMenu);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la création du menu'
    });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const { nom, prix, categorie, disponible, taille, accompagnement, boisson, sauce } = req.body;

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        error: 'Menu non trouvé'
      });
    }

    if (nom) {
      menu.nom = nom;
    }
    if (prix !== undefined && prix !== '') {
      if (isNaN(prix) || Number(prix) <= 0) {
        return res.status(400).json({
          error: 'Prix invalide'
        });
      }
      menu.prix = Number(prix);
    }

    if (categorie) {
      menu.categorie = categorie;
    }

    if (disponible !== undefined) {
      menu.disponible = disponible;
    }

    if (taille) {
      menu.options.taille = taille;
    }

    if (accompagnement) {
      menu.options.accompagnement = accompagnement;
    }

    if (boisson) {
      menu.options.boisson = boisson;
    }

    if (sauce) {
      menu.options.sauce = sauce;
    }

    if (req.file) {
      const nouvelleCategorie = categorie || menu.categorie;

      if (process.env.NODE_ENV === 'production') {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `menus/${nouvelleCategorie}`
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(req.file.buffer);
        });

        menu.imageBurger = result.secure_url;
      } else {
        const dossier = `uploads/${nouvelleCategorie}`;

        if (!fs.existsSync(dossier)) {
          fs.mkdirSync(dossier, { recursive: true });
        }

        const nouveauChemin = path.join(dossier, req.file.filename);

        fs.renameSync(req.file.path, nouveauChemin);

        const ancienneImage = path.join('uploads', menu.imageBurger);

        if (fs.existsSync(ancienneImage)) {
          fs.unlinkSync(ancienneImage);
        }

        menu.imageBurger = `${nouvelleCategorie}/${req.file.filename}`;
      }
    }

    const updatedMenu = await menu.save();

    res.status(200).json(updatedMenu);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la modification du menu'
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        error: 'Menu non trouvé'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      const cheminImageBurger = path.join('uploads', menu.imageBurger);

      if (fs.existsSync(cheminImageBurger)) {
        fs.unlinkSync(cheminImageBurger);
      }
    }

    await menu.deleteOne();

    res.json({
      message: 'Menu supprimé avec succès'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la suppression du menu'
    });
  }
};
