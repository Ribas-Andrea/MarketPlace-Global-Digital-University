const User = require("../models/user");
const mongoose = require('mongoose');
const passwordValidator = require('password-validator'); // plugin de sécurité du mdp
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');
const roleCheck = require('../middleware/roleMiddleware');


exports.register = async (req, res) => {
  try{
    const {username, password, role} = req.body;
    if(!username || !password || !role)
      return res.status(400).json({message: 'Email, password et role obligatoire'});  

    const schema = new passwordValidator();
    schema.is().min(8).has().uppercase().has().digits().has().not().spaces;
    // le mdp doit avoir :  
    // * au moins 8 caractères = .min(8),
    // * au moins une majuscule =  has().uppercase(),
    // * au moins un nombre = .has().digits(),
    // * il ne doit pas y avoir d'espace = .has().not().spaces
    // * au moins un symbol = .has().symbols

    // On vérifie si le mot de passe est conforme : 
    if(!schema.validate(password)){
      return res.status(400).json({message: 'Mot de passe trop faible'});
    }

    // on vérifie si l'utilisateur existe déjà : 
    const existingUser = await User.findOne({ username });
    if(existingUser)
      return res.status(400).json({message: 'Compte déjà existant'});

      // il faut hacher les mots de passe : 
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });

    await newUser.save();
    res.status(201).json(newUser);

  } catch(err) {
    console.error(err);
    res.status(500).json({message: 'Erreur Serveur'});
  }

}

exports.getUsers = async (req, res) => {
  try {
    const filtre = {};

    if (req.query.role) {
      filtre.role = req.query.role;
    }

    const users = await User.find(filtre);

    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({
      error: "Erreur lors de la récupération des utilisateurs"
    });
  }
};

exports.getUser = async (req, res) => {
  try {

    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error: 'ID invalide'});

    const user = await User.findById(id);
    if(!user)
      return res.status(404).json({error: 'Utilisateur non trouvé'});

    res.status(200).json({user});

  } catch(err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
}


exports.login = async (req, res) => {
  try{
      const {username, password, role} = req.body;
      if(!username || !password ||!role)
        return res.status(400).json({message: 'Email, password et role obligatoire'});

      // on vérifie si l'utilisateur existe déjà : 
      const existingUser = await User.findOne({ username, role });
      if(!existingUser)
        return res.status(400).json({message: 'Identifiant Invalides'});

      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
      if(!isPasswordCorrect)
        return res.status(400).json({message: 'Identifiant Invalides'});



      const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role
      },
      process.env.JWT_SECRET, 
      {expiresIn: '7d'}
      );
      res.status(200).json({token, user: existingUser});

  } catch(err) {
  console.error(err);
  res.status(500).json({message: 'Erreur Serveur'});
  }
}


exports.updateUser = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  const {username, password, role} = req.body;


  const user = await User.findById(id);
  if(!user){
  return res.status(404).json({error: 'Utilisateur non trouvé'});
  }

  if (req.body.username !== undefined) {
  return res.status(403).json({
    error: 'Modification du nom d\'utilisateur interdite'
  });
}


const rolesValides = Object.values(ROLES); // ['administrateur', 'accueil', 'preparateur']

if (role && !rolesValides.includes(role)) {
  return res.status(400).json({ error: 'Rôle invalide' });
}

  // Les données modifiées : 

  // il faut hacher les mots de passe : 
  const hashedPassword = await bcrypt.hash(password, 10);

  if(password)
      user.password = hashedPassword;
  if(role)
      user.role = role;


  // On sauvegarde l'utilisateur : 

  const updatedUser = await user.save();
  res.json(updatedUser);

} catch(err) {
  console.error(err);
  res.status(500).json({error: 'erreur lors de la modification de l\'utilisateur'});
}
};


exports.deleteUser = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  
  const user = await User.findById(id);
  if(!user){
  return res.status(404).json({error: 'Utilisateur non trouvé'});
  }
  
if (user.id !== req.user.userId && req.user.role !== 'administrateur') {
  return res.status(403).json({ message: "Oh le petit malin !!!" });
}
// ici seul l'administrateur peut supprimer un autre utilisateur

 

  // Les données modifiées : 
  await user.deleteOne();
  res.json({message: 'Utilisateur supprimé avec succès'});



} catch(err) {
  console.error(err);
  res.status(500).json({error: 'Erreur lors de la suppression de l\'utilisateur'});
}
};