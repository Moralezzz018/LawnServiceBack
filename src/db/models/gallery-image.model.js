const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const GalleryImage = sequelize.define(
  'GalleryImage',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    src: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alt: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Gallery image',
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
  },
  {
    tableName: 'gallery_images',
    timestamps: true,
  }
);

module.exports = GalleryImage;
