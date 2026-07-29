const Product = require("../models/product");
const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const filtre = {};

    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }

    if (req.query.disponible !== undefined) {
      filtre.disponible = req.query.disponible === "true";
    }


// console.log(req.query);
// console.log(filtre);


    const products = await Product.find(filtre);

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération des produits"
    });
  }
};

exports.getProduct = async (req, res) => {
  try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error: 'ID invalide'});

    const product = await Product.findById(id);
    if(!product)
      return res.status(404).json({error: 'Produit non trouvé'});

    res.status(200).json({product});

  } catch(err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
}

exports.createProduct = async (req, res) => {
try {
  const {nom, prix, categorie, disponible} = req.body;

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

  const image = `${categorie}/${req.file.filename}`;

  if(!nom)
      return res.status(400).json({error: 'Nom obligatoire'});

  if(!prix)
    return res.status(400).json({error: 'Prix obligatoire'});

  if (disponible === undefined)
  return res.status(400).json({ error: 'Disponibilité obligatoire' });

  // On peut ajouter les droits de l'utilisateur ici selon son rôle

  const product = new Product({
    image,
    nom,
    prix,
    categorie,
    disponible
  });

  const savedProduct = await product.save();
  res.status(201).json(savedProduct);
} catch(err) {
  console.error(err);
  res.status(500).json({error: 'erreur lors de la création du produit'});
}
 
}

exports.updateProduct = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  const {nom, prix, categorie, disponible} = req.body;

  const product = await Product.findById(id);
  if(!product){
  return res.status(404).json({error: 'Produit non trouvé'});
  }


  let image;

  if (req.file) {
  image = `${categorie || product.categorie}/${req.file.filename}`;
  }


  // Les données modifiées : 
  if(nom)
      product.nom = nom;
  if(prix)
      product.prix = prix;

  if(categorie)
      product.categorie = categorie;

  if(image)
      product.image = image;

  if (disponible !== undefined)
    product.disponible = disponible;

  // On sauvegarde le produit : 

  const updatedProduct = await product.save();
  res.json(updatedProduct);

} catch(err) {
  console.error(err);
  res.status(500).json({error: 'erreur lors de la modification du produit'});
}
};

exports.deleteProduct = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  
  const product = await Product.findById(id);
  if(!product){
  return res.status(404).json({error: 'Produit non trouvé'});
  }

  const cheminImage = path.join("uploads", product.image);

  if (fs.existsSync(cheminImage)) {
    fs.unlinkSync(cheminImage);
  }


  // Les données modifiées : 
  await product.deleteOne();
  res.json({message: 'Produit supprimé avec succès'});



} catch(err) {
  console.error(err);
  res.status(500).json({error: 'Erreur lors de la suppression du produit'});
}
};