const fs = require('fs');
const path = require('path');
const multer = require('multer');
const env = require('../config/env');

const configuredDestination = path.isAbsolute(env.uploadDir)
  ? env.uploadDir
  : path.resolve(process.cwd(), env.uploadDir);

let destination = configuredDestination;

try {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
} catch (error) {
  if (error.code !== 'EACCES' && error.code !== 'EPERM') {
    throw error;
  }

  destination = path.resolve(process.cwd(), 'uploads');

  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  console.warn(
    `[UPLOAD] No write permission for "${configuredDestination}". Falling back to "${destination}".`
  );
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, destination),
  filename: (_, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
