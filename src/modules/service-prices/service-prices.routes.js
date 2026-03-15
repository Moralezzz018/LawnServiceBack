const { Router } = require('express');
const authOwner = require('../../middlewares/authOwner');
const validateRequest = require('../../middlewares/validateRequest');
const { saveServicePricesRules } = require('./service-prices.validators');
const { getServicePrices, saveServicePrices } = require('./service-prices.controller');

const router = Router();

router.use(authOwner);

router.get('/', getServicePrices);
router.put('/', saveServicePricesRules, validateRequest, saveServicePrices);

module.exports = router;
