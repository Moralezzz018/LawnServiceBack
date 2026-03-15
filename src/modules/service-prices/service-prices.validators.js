const { body } = require('express-validator');

const saveServicePricesRules = [
  body('services').isArray({ min: 1 }),
  body('services.*.id').isInt({ min: 1 }),
  body('services.*.price').isFloat({ min: 0 }),
  body('services.*.unit').isString().trim().isLength({ min: 1, max: 20 }),
  body('services.*.isActive').isBoolean(),
];

module.exports = {
  saveServicePricesRules,
};
