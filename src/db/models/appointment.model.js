const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    serviceAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceTypes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    preferredDateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONTACTED', 'CLOSED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    tableName: 'appointments',
    timestamps: true,
  }
);

module.exports = Appointment;
