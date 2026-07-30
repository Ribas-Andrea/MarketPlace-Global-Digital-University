const role = (req, res, next) => {
  const administrateur = req.header('Authorization').split(' ')[1];
 
  if (!administrateur)
    return res.status(401).json({message: 'Vous n\'êtes pas un administrateur'});
}

module.exports = role;