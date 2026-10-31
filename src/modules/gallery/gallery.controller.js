const fs = require('fs');
const path = require('path');
const { GalleryImage, sequelize } = require('../../db/models');
const { GALLERY_CATEGORIES } = require('../../db/models/gallery-image.model');
const env = require('../../config/env');

const defaultGalleryImages = [
  { src: '/images/IMG_9600.jpg', alt: 'Professional lawn mowing', category: 'lawn' },
  { src: '/images/img_002.jpg', alt: 'Professional lawn mowing', category: 'lawn' },
  { src: '/images/IMG_4863.jpg', alt: 'Trimmed bushes and landscaping', category: 'trimming' },
  { src: '/images/IMG_4864.jpg', alt: 'Mulch garden beds', category: 'mulching' },
  { src: '/images/IMG_4883.jpg', alt: 'Colorful flower garden', category: 'flowers' },
  { src: '/images/IMG_5158.jpg', alt: 'Tree trimming service', category: 'trimming' },
  { src: '/images/IMG_6134.jpg', alt: 'Manicured lawn', category: 'lawn' },
];

async function ensureDefaults() {
  await GalleryImage.sync({ alter: true });

  const count = await GalleryImage.count();
  if (count > 0) return;

  await GalleryImage.bulkCreate(
    defaultGalleryImages.map((image, index) => ({
      src: image.src,
      alt: image.alt,
      position: index + 1,
      category: image.category,
    }))
  );
}

function toPublicSrc(src, req) {
  if (!src) return src;
  if (!src.startsWith('/uploads/')) return src;

  const forwardedProtoHeader = req.get('x-forwarded-proto') || '';
  const forwardedProto = forwardedProtoHeader.split(',')[0].trim();
  const protocol = forwardedProto || req.protocol || 'https';

  return `${protocol}://${req.get('host')}${src}`;
}

function normalizeRow(row, req) {
  return {
    id: row.id,
    src: toPublicSrc(row.src, req),
    alt: row.alt,
    position: row.position,
    category: row.category || 'general',
    createdAt: row.createdAt,
  };
}

async function listGallery(req, res, next) {
  try {
    await ensureDefaults();

    const { category } = req.query;

    const where = {};
    if (category && GALLERY_CATEGORIES.includes(category)) {
      where.category = category;
    }

    const rows = await GalleryImage.findAll({
      where,
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.json({
      data: rows.map((row) => normalizeRow(row, req)),
      categories: GALLERY_CATEGORIES,
    });
  } catch (error) {
    return next(error);
  }
}

async function uploadGalleryImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    await ensureDefaults();

    const category = req.body.category && GALLERY_CATEGORIES.includes(req.body.category)
      ? req.body.category
      : 'general';

    const maxPosition = (await GalleryImage.max('position')) || 0;
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, '');

    const row = await GalleryImage.create({
      src: `/uploads/gallery/${req.file.filename}`,
      alt: req.body.alt?.trim() || originalName || 'Gallery image',
      position: maxPosition + 1,
      category,
    });

    const rows = await GalleryImage.findAll({
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.status(201).json({
      message: 'Image uploaded successfully',
      created: normalizeRow(row, req),
      data: rows.map((item) => normalizeRow(item, req)),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteGalleryImage(req, res, next) {
  try {
    const { id } = req.params;
    const imageId = Number(id);

    if (!Number.isFinite(imageId) || imageId < 1) {
      return res.status(400).json({ message: 'Invalid image id' });
    }

    const row = await GalleryImage.findByPk(imageId);

    if (!row) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Eliminar el archivo físico si fue subido (no son imágenes estáticas del frontend)
    if (row.src && row.src.startsWith('/uploads/')) {
      try {
        const configuredBaseDir = path.isAbsolute(env.uploadDir)
          ? env.uploadDir
          : path.resolve(process.cwd(), env.uploadDir);
        const filePath = path.join(configuredBaseDir, 'gallery', path.basename(row.src));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        // No bloqueamos la operación si el archivo no se puede borrar
        console.warn(`[DELETE_GALLERY] Could not delete file: ${fileError.message}`);
      }
    }

    await row.destroy();

    // Re-numerar posiciones para que no queden huecos
    const remaining = await GalleryImage.findAll({
      order: [['position', 'ASC'], ['id', 'ASC']],
    });

    await sequelize.transaction(async (transaction) => {
      await Promise.all(
        remaining.map((item, index) =>
          GalleryImage.update(
            { position: index + 1 },
            { where: { id: item.id }, transaction }
          )
        )
      );
    });

    const updatedRows = await GalleryImage.findAll({
      order: [['position', 'ASC'], ['id', 'ASC']],
    });

    return res.json({
      message: 'Image deleted successfully',
      data: updatedRows.map((item) => normalizeRow(item, req)),
    });
  } catch (error) {
    return next(error);
  }
}

async function reorderGallery(req, res, next) {
  try {
    await ensureDefaults();

    const imageIds = req.body.imageIds.map((id) => Number(id));
    const uniqueIds = [...new Set(imageIds)];

    if (uniqueIds.length !== imageIds.length) {
      return res.status(400).json({ message: 'imageIds cannot contain duplicates' });
    }

    const rows = await GalleryImage.findAll({
      attributes: ['id'],
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    const existingIds = rows.map((item) => item.id);
    if (existingIds.length !== uniqueIds.length) {
      return res.status(400).json({ message: 'imageIds must include all gallery images' });
    }

    const existingSet = new Set(existingIds);
    const allValid = uniqueIds.every((id) => existingSet.has(id));

    if (!allValid) {
      return res.status(400).json({ message: 'imageIds contains unknown ids' });
    }

    await sequelize.transaction(async (transaction) => {
      await Promise.all(
        uniqueIds.map((id, index) =>
          GalleryImage.update(
            { position: index + 1 },
            {
              where: { id },
              transaction,
            }
          )
        )
      );
    });

    const updatedRows = await GalleryImage.findAll({
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.json({
      message: 'Gallery order updated successfully',
      data: updatedRows.map((item) => normalizeRow(item, req)),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listGallery,
  uploadGalleryImage,
  deleteGalleryImage,
  reorderGallery,
};
