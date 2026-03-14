const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Quote = sequelize.define(
  'Quote',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientFullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    serviceAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    serviceTypes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    estimatedAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'SENT', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'DRAFT',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachmentPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'quotes',
    timestamps: true,
  }
);

module.exports = Quote;
