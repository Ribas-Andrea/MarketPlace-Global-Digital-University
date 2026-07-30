const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
  const token = req.header('Authorization').split(' ')[1];
  // Un token se compose comme ceci : 
  // Authorization: Bearer ....
  // On veut récupérer .... donc il faut supprimer l'espace avec .split(' ') et ensuite on récupère les .... avec [1]
  if (!token)
    return res.status(401).json({message: 'Veuillez vous connecter'});

  try{
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedUser;
    next();
  } catch(err) {
    return res.status(401).json({message: 'Veuillez vous connecter'})
  }
}

module.exports = auth;