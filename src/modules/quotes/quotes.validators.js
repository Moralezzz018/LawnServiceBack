const { body } = require('express-validator');

const createQuoteRules = [
  body('clientFullName').isString().trim().isLength({ min: 3, max: 120 }),
  body('phone').optional().isString().trim().isLength({ min: 7, max: 25 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('serviceAddress').optional().isString().trim().isLength({ min: 5, max: 255 }),
  body('lineItems').isArray({ min: 1 }),
  body('lineItems.*.serviceId').isInt({ min: 1 }),
  body('lineItems.*.serviceName').isString().trim().isLength({ min: 2, max: 80 }),
  body('lineItems.*.unit').isString().trim().isLength({ min: 1, max: 20 }),
  body('lineItems.*.unitPrice').isFloat({ min: 0 }),
  body('lineItems.*.quantity').isFloat({ min: 0.01 }),
  body('lineItems.*.subtotal').isFloat({ min: 0 }),
  body('currency').optional().isString().trim().isLength({ min: 3, max: 3 }),
  body('status').optional().isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']),
  body('notes').optional().isString().trim().isLength({ max: 1500 }),
];

module.exports = {
  createQuoteRules,
};
