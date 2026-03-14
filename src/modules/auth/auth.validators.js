const { body } = require('express-validator');

const registerOwnerRules = [
  body('bootstrapKey').isString().notEmpty(),
  body('fullName').isString().trim().isLength({ min: 3, max: 120 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 64 }),
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
];

module.exports = {
  registerOwnerRules,
  loginRules,
};
