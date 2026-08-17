const User = require('../models/user');
const mongoose = require('mongoose');
const passwordValidator = require('password-validator');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ROLES = require('../config/roles');
const roleCheck = require('../middleware/roleMiddleware');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Email et password obligatoire' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schema = new passwordValidator();
    schema.is().min(8).has().uppercase().has().digits().has().not().spaces;

    if (!schema.validate(password)) {
      return res.status(400).json({ message: 'Mot de passe trop faible' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Compte déjà existant' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: 'client'
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur Serveur' });
  }
};

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
      error: 'Erreur lors de la récupération des utilisateurs'
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération de l'utilisateur" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Email et password obligatoire' });

    const existingUser = await User.findOne({ username });
    if (!existingUser) return res.status(400).json({ message: 'Identifiant Invalides' });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: 'Identifiant Invalides' });

    const token = jwt.sign(
      {
        userId: existingUser._id,
        role: existingUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({ token, user: existingUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur Serveur' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'ID invalide'
      });
    }

    const { password, role } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    if (req.body.username !== undefined) {
      return res.status(403).json({
        error: "Modification du nom d'utilisateur interdite"
      });
    }

    const rolesValides = Object.values(ROLES);

    if (role && !rolesValides.includes(role)) {
      return res.status(400).json({
        error: 'Rôle invalide'
      });
    }

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    if (role) {
      user.role = role;
    }

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Erreur lors de la modification de l'utilisateur"
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'ID invalide' });

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
};
