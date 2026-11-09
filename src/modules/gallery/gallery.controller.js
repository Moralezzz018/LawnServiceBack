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

  // Limpiar imágenes fantasma (registros huérfanos que apuntan a /uploads/ pero no tienen imageData ni archivo en disco)
  try {
    const configuredBaseDir = path.isAbsolute(env.uploadDir)
      ? env.uploadDir
      : path.resolve(process.cwd(), env.uploadDir);

    const allImages = await GalleryImage.findAll();
    for (const img of allImages) {
      if (img.src && img.src.startsWith('/uploads/') && !img.imageData) {
        const filePath = path.join(configuredBaseDir, 'gallery', path.basename(img.src));
        if (!fs.existsSync(filePath)) {
          // El archivo físico desapareció en Render: limpiar registro fantasma
          await img.destroy();
        }
      }
    }
  } catch (cleanError) {
    console.warn('[ENSURE_DEFAULTS] Warning cleaning orphan images:', cleanError.message);
  }

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
  if (src.startsWith('/uploads/') || src.startsWith('/api/gallery/image/')) {
    const forwardedProtoHeader = req.get('x-forwarded-proto') || '';
    const forwardedProto = forwardedProtoHeader.split(',')[0].trim();
    const protocol = forwardedProto || req.protocol || 'https';
    return `${protocol}://${req.get('host')}${src}`;
  }
  return src;
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

    // Excluimos imageData del listado para que la respuesta JSON sea ligera y ultra rápida
    const rows = await GalleryImage.findAll({
      where,
      attributes: ['id', 'src', 'alt', 'position', 'category', 'createdAt'],
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

/**
 * GET /api/gallery/image/:id
 * Sirve la imagen binaria desde PostgreSQL con encabezados de caché
 */
async function getGalleryImageBlob(req, res, next) {
  try {
    const { id } = req.params;
    const row = await GalleryImage.findByPk(id);

    if (!row) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // 1. Si está almacenada en PostgreSQL como base64
    if (row.imageData) {
      const buffer = Buffer.from(row.imageData, 'base64');
      res.setHeader('Content-Type', row.mimeType || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    }

    // 2. Si existe como archivo local en disco
    if (row.src && row.src.startsWith('/uploads/')) {
      const configuredBaseDir = path.isAbsolute(env.uploadDir)
        ? env.uploadDir
        : path.resolve(process.cwd(), env.uploadDir);
      const filePath = path.join(configuredBaseDir, 'gallery', path.basename(row.src));
      if (fs.existsSync(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.sendFile(filePath);
      }
    }

    return res.status(404).json({ message: 'Image file not found' });
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

    // Convertir el archivo a base64 para guardarlo en la base de datos (persistencia en Render)
    let base64Data = null;
    try {
      if (req.file.path && fs.existsSync(req.file.path)) {
        base64Data = fs.readFileSync(req.file.path).toString('base64');
      }
    } catch (readErr) {
      console.warn('[UPLOAD_GALLERY] Could not read file buffer:', readErr.message);
    }

    const row = await GalleryImage.create({
      src: `/uploads/gallery/${req.file.filename}`,
      imageData: base64Data,
      mimeType: req.file.mimetype || 'image/jpeg',
      alt: req.body.alt?.trim() || originalName || 'Gallery image',
      position: maxPosition + 1,
      category,
    });

    // Si guardamos la imagen en la DB, el src apuntará al endpoint persistente
    if (base64Data) {
      row.src = `/api/gallery/image/${row.id}`;
      await row.save();
    }

    const rows = await GalleryImage.findAll({
      attributes: ['id', 'src', 'alt', 'position', 'category', 'createdAt'],
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
        console.warn(`[DELETE_GALLERY] Could not delete file: ${fileError.message}`);
      }
    }

    await row.destroy();

    // Re-numerar posiciones
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
      attributes: ['id', 'src', 'alt', 'position', 'category', 'createdAt'],
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
      attributes: ['id', 'src', 'alt', 'position', 'category', 'createdAt'],
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

/**
 * POST /api/gallery/reset-defaults
 * Permite al admin restaurar la galería original si lo desea
 */
async function resetGalleryDefaults(req, res, next) {
  try {
    await GalleryImage.destroy({ where: {}, truncate: true });

    await GalleryImage.bulkCreate(
      defaultGalleryImages.map((image, index) => ({
        src: image.src,
        alt: image.alt,
        position: index + 1,
        category: image.category,
      }))
    );

    const rows = await GalleryImage.findAll({
      attributes: ['id', 'src', 'alt', 'position', 'category', 'createdAt'],
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.json({
      message: 'Gallery reset to default images successfully',
      data: rows.map((item) => normalizeRow(item, req)),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listGallery,
  getGalleryImageBlob,
  uploadGalleryImage,
  deleteGalleryImage,
  reorderGallery,
  resetGalleryDefaults,
};
