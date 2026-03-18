const sequelize = require('../sequelize');
const User = require('./user.model');
const Appointment = require('./appointment.model');
const Quote = require('./quote.model');
const ServicePrice = require('./service-price.model');
const GalleryImage = require('./gallery-image.model');

const db = {
  sequelize,
  User,
  Appointment,
  Quote,
  ServicePrice,
  GalleryImage,
};

module.exports = db;
