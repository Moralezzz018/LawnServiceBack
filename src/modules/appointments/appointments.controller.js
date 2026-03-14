const { Appointment } = require('../../db/models');
const { sendAppointmentNotification } = require('../../services/email.service');

async function createAppointment(req, res, next) {
  try {
    const payload = {
      fullName: req.body.fullName,
      phone: req.body.phone,
      email: req.body.email,
      serviceAddress: req.body.serviceAddress,
      serviceTypes: req.body.serviceTypes,
      preferredDateTime: new Date(req.body.preferredDateTime),
      notes: req.body.notes || null,
      status: 'PENDING',
    };

    const appointment = await Appointment.create(payload);

    await sendAppointmentNotification({
      ...payload,
      preferredDateTime: payload.preferredDateTime.toISOString(),
    });

    return res.status(201).json({
      message: 'Appointment created successfully',
      data: appointment,
    });
  } catch (error) {
    return next(error);
  }
}

async function listAppointments(req, res, next) {
  try {
    const appointments = await Appointment.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ data: appointments });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
};
