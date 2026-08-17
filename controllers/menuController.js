const Menu = require('../models/menu');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });

    const menu = await Menu.findById(id);
    if (!menu) return res.status(404).json({ error: 'Menu non trouvé' });

    res.status(200).json({ menu });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { nom, prix, categorie, disponible, taille, accompagnement, boisson, sauce } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image obligatoire' });
    }

    if (!categorie) return res.status(400).json({ error: 'Catégorie obligatoire' });
    if (!nom) return res.status(400).json({ error: 'Nom obligatoire' });
    if (!prix) return res.status(400).json({ error: 'Prix obligatoire' });
    if (disponible === undefined) return res.status(400).json({ error: 'Disponibilité obligatoire' });
    if (!taille) return res.status(400).json({ error: 'Taille obligatoire' });
    if (!accompagnement) return res.status(400).json({ error: 'Accompagnement obligatoire' });
    if (!boisson) return res.status(400).json({ error: 'Boisson obligatoire' });
    if (!sauce) return res.status(400).json({ error: 'Sauce obligatoire' });

    const dossier = path.join('uploads', categorie);

    if (!fs.existsSync(dossier)) {
      fs.mkdirSync(dossier, { recursive: true });
    }

    const nouveauChemin = path.join(dossier, req.file.filename);

    fs.renameSync(req.file.path, nouveauChemin);

    const imageBurger = `${categorie}/${req.file.filename}`;

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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du menu' });
  }
};

exports.updateMenu = async (req, res) => {
  let nouveauChemin;

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const { nom, prix, categorie, disponible, taille, accompagnement, boisson, sauce } = req.body;

    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }

    if (nom) menu.nom = nom;
    if (prix) menu.prix = prix;
    if (categorie) menu.categorie = categorie;
    if (disponible !== undefined) menu.disponible = disponible;
    if (taille) menu.options.taille = taille;
    if (accompagnement) menu.options.accompagnement = accompagnement;
    if (boisson) menu.options.boisson = boisson;
    if (sauce) menu.options.sauce = sauce;

    if (req.file) {
      const nouvelleCategorie = categorie || menu.categorie;

      const dossier = path.join('uploads', nouvelleCategorie);

      if (!fs.existsSync(dossier)) {
        fs.mkdirSync(dossier, { recursive: true });
      }

      nouveauChemin = path.join(dossier, req.file.filename);

      fs.renameSync(req.file.path, nouveauChemin);


      const ancienneImage = path.join('uploads', menu.imageBurger);

      if (fs.existsSync(ancienneImage)) {
        fs.unlinkSync(ancienneImage);
      }


      menu.imageBurger = `${nouvelleCategorie}/${req.file.filename}`;
    }

    const updatedMenu = await menu.save();

    res.status(200).json(updatedMenu);
  } catch (err) {
    if (nouveauChemin && fs.existsSync(nouveauChemin)) {
      fs.unlinkSync(nouveauChemin);
    }

    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la modification du menu'
    });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ error: 'Menu non trouvé' });
    }

    const cheminImageBurger = path.join('uploads', menu.imageBurger);

    if (fs.existsSync(cheminImageBurger)) {
      fs.unlinkSync(cheminImageBurger);
    }

    await menu.deleteOne();
    res.json({ message: 'Menu supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la suppression du menu' });
  }
};
