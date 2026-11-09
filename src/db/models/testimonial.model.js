const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const Testimonial = sequelize.define(
  'Testimonial',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    service: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 1000],
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      validate: {
        min: 1,
        max: 5,
      },
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Visible inmediatamente en el sitio público
    },
  },
  {
    tableName: 'testimonials',
    timestamps: true,
  }
);

module.exports = Testimonial;
