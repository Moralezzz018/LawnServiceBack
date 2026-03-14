const { body } = require('express-validator');

const createQuoteRules = [
  body('clientFullName').isString().trim().isLength({ min: 3, max: 120 }),
  body('phone').optional().isString().trim().isLength({ min: 7, max: 25 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('serviceAddress').optional().isString().trim().isLength({ min: 5, max: 255 }),
  body('serviceTypes').isArray({ min: 1 }),
  body('serviceTypes.*').isString().trim().isLength({ min: 2, max: 60 }),
  body('estimatedAmount').optional().isDecimal(),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('status').optional().isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']),
  body('notes').optional().isString().trim().isLength({ max: 1500 }),
];

module.exports = {
  createQuoteRules,
};
