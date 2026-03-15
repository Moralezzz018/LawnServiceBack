const { Router } = require('express');
const validateRequest = require('../../middlewares/validateRequest');
const authOwner = require('../../middlewares/authOwner');
const { createAppointmentRules } = require('./appointments.validators');
const { createAppointment, listAppointments, searchAppointments } = require('./appointments.controller');

const router = Router();

router.post('/', createAppointmentRules, validateRequest, createAppointment);
router.get('/', authOwner, listAppointments);
router.get('/search', authOwner, searchAppointments);

module.exports = router;
