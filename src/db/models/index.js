const sequelize = require('../sequelize');
const User = require('./user.model');
const Appointment = require('./appointment.model');
const Quote = require('./quote.model');

const db = {
  sequelize,
  User,
  Appointment,
  Quote,
};

module.exports = db;
