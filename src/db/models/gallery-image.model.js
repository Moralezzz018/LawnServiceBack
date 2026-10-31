const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

// Categorías vinculadas a los servicios reales del negocio
const GALLERY_CATEGORIES = [
  'general',
  'lawn',
  'trimming',
  'plants',
  'mulching',
  'flowers',
  'cleanup',
];

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
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'general',
      validate: {
        isIn: [GALLERY_CATEGORIES],
      },
    },
  },
  {
    tableName: 'gallery_images',
    timestamps: true,
  }
);

module.exports = GalleryImage;
module.exports.GALLERY_CATEGORIES = GALLERY_CATEGORIES;
