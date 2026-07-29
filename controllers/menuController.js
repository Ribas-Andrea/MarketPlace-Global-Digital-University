const Menu = require("../models/menu");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");

exports.getMenus = async (req, res) =>{
  try {
    const menus = await Menu.find();

    res.status(200).json({ menus });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération des menus"
    });
  }
};

exports.getMenu = async (req, res) => {
 try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error: 'ID invalide'});

    const menu = await Menu.findById(id);
    if(!menu)
      return res.status(404).json({error: 'Menu non trouvé'});

    res.status(200).json({menu});

  } catch(err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du menu' });
  }
}

exports.createMenu = async (req, res) => {
try {
  const {
    nom, 
    prix, 
    categorie, 
    disponible, 
    taille,
    accompagnement,
    boisson,
    sauce
  } = req.body;

  if (!req.file) {
  return res.status(400).json({ error: 'Image obligatoire' });
  }

  if (!categorie)
  return res.status(400).json({ error: 'Catégorie obligatoire' });

  const dossier = `uploads/${categorie}`;

  if (!fs.existsSync(dossier)) {
  fs.mkdirSync(dossier, { recursive: true });
  }

  const ancienChemin = req.file.path;
  const nouveauChemin = path.join(dossier, req.file.filename);

  fs.renameSync(ancienChemin, nouveauChemin);

  const imageBurger = `${categorie}/${req.file.filename}`;

  if(!nom)
      return res.status(400).json({error: 'Nom obligatoire'});

  if(!prix)
    return res.status(400).json({error: 'Prix obligatoire'});

  if (disponible === undefined)
  return res.status(400).json({ error: 'Disponibilité obligatoire' });

  if (!taille)
  return res.status(400).json({ error: 'Taille obligatoire obligatoire' });

  if (!accompagnement)
  return res.status(400).json({ error: 'Accompagnement obligatoire obligatoire' });

  if (!boisson)
  return res.status(400).json({ error: 'Boisson obligatoire obligatoire' });

  if (!sauce)
  return res.status(400).json({ error: 'Sauce obligatoire obligatoire' });

  // On peut ajouter les droits de l'utilisateur ici selon son rôle

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
} catch(err) {
  console.error(err);
  res.status(500).json({error: 'erreur lors de la création du menu'});
}
 
}

exports.updateMenu = async (req, res) =>{

};

exports.deleteMenu = async (req, res) =>{

};