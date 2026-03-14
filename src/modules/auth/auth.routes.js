const { Router } = require('express');
const validateRequest = require('../../middlewares/validateRequest');
const authOwner = require('../../middlewares/authOwner');
const { registerOwnerRules, loginRules } = require('./auth.validators');
const { registerOwner, loginOwner, me } = require('./auth.controller');

const router = Router();

router.post('/register-owner', registerOwnerRules, validateRequest, registerOwner);
router.post('/login', loginRules, validateRequest, loginOwner);
router.get('/me', authOwner, me);

module.exports = router;
