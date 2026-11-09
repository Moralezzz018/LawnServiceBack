const { body } = require('express-validator');

const createTestimonialRules = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('location')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),

  body('service')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service must be between 2 and 100 characters'),

  body('text')
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review must be between 10 and 1000 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

module.exports = { createTestimonialRules };
