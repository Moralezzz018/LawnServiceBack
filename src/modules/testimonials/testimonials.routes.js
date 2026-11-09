const { Router } = require('express');
const authOwner = require('../../middlewares/authOwner');
const validateRequest = require('../../middlewares/validateRequest');
const { createTestimonialRules } = require('./testimonials.validators');
const {
  listTestimonials,
  createTestimonial,
  listAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
} = require('./testimonials.controller');

const router = Router();

// Públicas
router.get('/', listTestimonials);
router.post('/', createTestimonialRules, validateRequest, createTestimonial);

// Solo admin
router.get('/admin', authOwner, listAllTestimonials);
router.patch('/:id/approve', authOwner, approveTestimonial);
router.delete('/:id', authOwner, deleteTestimonial);

module.exports = router;
