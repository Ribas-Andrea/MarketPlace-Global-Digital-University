const Product = require("../models/product");

exports.getProducts = async (req, res) =>{
  try{
  const products = await Product
  .find()

  res.status(200).json([{products}]);
  } catch(err) {
      res.status(500).json([{error: 'Erreur lors de la récupération des produits' }]);
  }
};

exports.getProduct = (req, res) => {
  try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error: 'ID invalide'});

    const product = Product.findById(id);
    if(!product)
      return res.status(404).json({error: 'Produit non trouvé'})

  } catch {
    res.status(200).json({produit});
  }
}

exports.createProduct = async (req, res) => {
try {
  const {image, nom, prix} = req.body;


  if(!image)
    return res.status(400).json({error: 'Image obligatoire'});

  if(!nom)
      return res.status(400).json({error: 'Nom obligatoire'});

  if(!prix)
    return res.status(400).json({error: 'Prix obligatoire'});

  // On peut ajouter les droits de l'utilisateur ici selon son rôle

  const product = new Product({
    image,
    nom,
    prix
  });

  const savedProduct = await product.save();
  res.status(201).json(savedProduct);
} catch(err) {
  console.error(err);
  res.status(500).json({error: 'erreur lors de la création'});
}
 

}