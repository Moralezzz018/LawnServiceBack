const { Router } = require('express');
const { body, param } = require('express-validator');
const authOwner = require('../../middlewares/authOwner');
const validateRequest = require('../../middlewares/validateRequest');
const upload = require('../../middlewares/upload');
const { createQuoteRules } = require('./quotes.validators');
const { createQuote, listQuotes, updateQuoteStatus } = require('./quotes.controller');

const router = Router();

router.use(authOwner);

router.get('/', listQuotes);
router.post('/', upload.single('attachment'), createQuoteRules, validateRequest, createQuote);
router.patch(
  '/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['DRAFT', 'SENT', 'APPROVED', 'REJECTED']),
  ],
  validateRequest,
  updateQuoteStatus
);

module.exports = router;
