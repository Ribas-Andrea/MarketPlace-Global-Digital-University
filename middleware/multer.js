const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const chemin = `uploads/tempo`;

    if (!fs.existsSync(chemin)) {
      fs.mkdirSync(chemin, { recursive: true });
    }

    callback(null, chemin);
  },

  filename: (req, file, callback) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 100000);
    callback(null, unique + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = /jpeg|jpg|jpeg|png|gif|webp/;
  const isExtensionValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeTypeValid = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';
  if (isExtensionValid && isMimeTypeValid) callback(null, true);
  else callback(new Error('Seules les images sont autorisées'));
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
