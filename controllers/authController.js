const User = require("../models/user");
const mongoose = require('mongoose');
const passwordValidator = require('password-validator'); // plugin de sécurité du mdp
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



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
      {userId: existingUser._id},
      process.env.JWT_SECRET, 
      {expiresIn: '7d'}
      );
      res.status(200).json({token, user: existingUser});

  } catch(err) {
  console.error(err);
  res.status(500).json({message: 'Erreur Serveur'});
  }
}






exports.deleteUser = async (req, res) =>{
try {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ error: 'ID invalide' });

  
  const user = await User.findById(id);
  if(!user){
  return res.status(404).json({error: 'Utilisateur non trouvé'});
  }

 

  // Les données modifiées : 
  await user.deleteOne();
  res.json({message: 'Utilisateur supprimé avec succès'});



} catch(err) {
  console.error(err);
  res.status(500).json({error: 'Erreur lors de la suppression de l\'utilisateur'});
}
};