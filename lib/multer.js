const multer = require("multer");
const path = require("path");

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Extensiones permitidas
    const fileTypes = /jpeg|jpg|png|gif/;
    const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extName && mimeType) {
      return cb(null, true);
    } else {
      return cb(new Error("Formato de archivo no válido"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
});

module.exports = upload;
