const { body } = require('express-validator');

const createAppointmentRules = [
  body('fullName').isString().trim().isLength({ min: 3, max: 120 }),
  body('phone').isString().trim().isLength({ min: 7, max: 25 }),
  body('email').isEmail().normalizeEmail(),
  body('serviceAddress').isString().trim().isLength({ min: 5, max: 255 }),
  body('serviceTypes').isArray({ min: 1 }),
  body('serviceTypes.*').isString().trim().isLength({ min: 2, max: 60 }),
  body('preferredDateTime').isISO8601(),
  body('notes').optional().isString().trim().isLength({ max: 1500 }),
];

module.exports = {
  createAppointmentRules,
};
