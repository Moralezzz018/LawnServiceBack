const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

const configuredBaseDir = path.isAbsolute(env.uploadDir)
  ? env.uploadDir
  : path.resolve(process.cwd(), env.uploadDir);

const configuredDestination = path.resolve(configuredBaseDir, 'gallery');

let destination = configuredDestination;

try {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
} catch (error) {
  if (error.code !== 'EACCES' && error.code !== 'EPERM') {
    throw error;
  }

  destination = path.resolve(process.cwd(), 'uploads', 'gallery');

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  console.warn(
    `[UPLOAD_GALLERY] No write permission for "${configuredDestination}". Falling back to "${destination}".`
  );
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, destination),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const imageFileFilter = (_, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    const error = new Error('Only image files are allowed');
    error.status = 400;
    cb(error);
    return;
  }

  cb(null, true);
};

const uploadGallery = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
});

module.exports = uploadGallery;
