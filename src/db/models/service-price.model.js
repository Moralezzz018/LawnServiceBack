const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const ServicePrice = sequelize.define(
  'ServicePrice',
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'per visit',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'service_prices',
    timestamps: true,
  }
);

module.exports = ServicePrice;
