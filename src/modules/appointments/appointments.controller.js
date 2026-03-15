const { Appointment } = require('../../db/models');
const { sendAppointmentNotification } = require('../../services/email.service');
const { Op } = require('sequelize');

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

async function searchAppointments(req, res, next) {
  try {
    const q = String(req.query.q || '').trim();

    if (!q) {
      return res.json({ data: [] });
    }

    const where = {
      [Op.or]: [{ fullName: { [Op.iLike]: `%${q}%` } }],
    };

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (uuidPattern.test(q)) {
      where[Op.or].push({ id: q });
    }

    const appointments = await Appointment.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 8,
    });

    return res.json({ data: appointments });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointment,
  listAppointments,
  searchAppointments,
};
