const { body } = require('express-validator');

const reorderGalleryRules = [
  body('imageIds').isArray({ min: 1 }),
  body('imageIds.*').isInt({ min: 1 }),
];

module.exports = {
  reorderGalleryRules,
};
