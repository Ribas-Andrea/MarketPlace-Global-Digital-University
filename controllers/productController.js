const Product = require('../models/product');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

exports.getProducts = async (req, res) => {
  try {
    const filtre = {};

    if (req.query.categorie) {
      filtre.categorie = req.query.categorie;
    }

    if (req.query.disponible !== undefined) {
      filtre.disponible = req.query.disponible === 'true';
    }

    const products = await Product.find(filtre);

    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({
      error: 'Erreur lors de la récupération des produits'
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Produit non trouvé' });

    res.status(200).json({ product });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { nom, prix, categorie, disponible } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image obligatoire' });
    }

    if (!nom) {
      return res.status(400).json({ error: 'Nom obligatoire' });
    }

    if (prix === undefined || prix === null || prix === '' || isNaN(prix) || Number(prix) <= 0) {
      return res.status(400).json({
        error: 'Prix invalide'
      });
    }

    if (!categorie) {
      return res.status(400).json({ error: 'Catégorie obligatoire' });
    }

    if (disponible === undefined) {
      return res.status(400).json({
        error: 'Disponibilité obligatoire'
      });
    }

    let image;

    if (process.env.NODE_ENV === 'production') {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `products/${categorie}`
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

      image = result.secure_url;
    } else {
      const dossier = `uploads/${categorie}`;

      if (!fs.existsSync(dossier)) {
        fs.mkdirSync(dossier, { recursive: true });
      }

      const ancienChemin = req.file.path;
      const nouveauChemin = path.join(dossier, req.file.filename);

      fs.renameSync(ancienChemin, nouveauChemin);

      image = `${categorie}/${req.file.filename}`;
    }

    const product = new Product({
      image,
      nom,
      prix,
      categorie,
      disponible
    });

    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la création du produit'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const { nom, prix, categorie, disponible } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    if (nom) product.nom = nom;
    if (prix !== undefined) {
      if (prix === '' || isNaN(prix) || Number(prix) <= 0) {
        return res.status(400).json({
          error: 'Prix invalide'
        });
      }
      product.prix = prix;
    }
    if (categorie) product.categorie = categorie;

    if (disponible !== undefined) {
      product.disponible = disponible;
    }

    if (req.file) {
      const nouvelleCategorie = categorie || product.categorie;

      if (process.env.NODE_ENV === 'production') {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `products/${nouvelleCategorie}`
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

        product.image = result.secure_url;
      } else {
        const dossier = `uploads/${nouvelleCategorie}`;

        if (!fs.existsSync(dossier)) {
          fs.mkdirSync(dossier, { recursive: true });
        }

        const nouveauChemin = path.join(dossier, req.file.filename);

        fs.renameSync(req.file.path, nouveauChemin);

        product.image = `${nouvelleCategorie}/${req.file.filename}`;
      }
    }

    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la modification du produit'
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé'
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      const cheminImage = path.join('uploads', product.image);

      if (fs.existsSync(cheminImage)) {
        fs.unlinkSync(cheminImage);
      }
    }

    await product.deleteOne();

    res.json({
      message: 'Produit supprimé avec succès'
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Erreur lors de la suppression du produit'
    });
  }
};
