const roleCheck = (...authRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Veuillez vous connecter' });
    }

    if (!authRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé pour votre rôle' });
    }

    next();
  };
};

module.exports = roleCheck;