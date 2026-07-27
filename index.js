const express = require('express');
const connectDB = require('./config/db');

const app = express();

app.use(express.json());


connectDB(); 

app.use('/api/products', require('./routes/productRoutes'));



app.listen(3000, () => console.log('Serveur running'));



// Routes que l'on va avoir besoin : 

// Liste des produits
// Détail d'un produit
// création d'un produit
// ajouter un produit
// modifier un produit
// supprimer un produit


// Liste des menus
// Détail d'un menu
// création d'un menu
// ajouter un menu
// modifier un menu
// ajouter un menu

// Liste des boissons
// Détail d'une boisson
// création d'une boisson
// ajouter une boisson
// modifier une boisson
// supprimer une boisson

// inscription
// connexion