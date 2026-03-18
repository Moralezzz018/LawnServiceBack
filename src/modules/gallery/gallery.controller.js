const { GalleryImage, sequelize } = require('../../db/models');

const defaultGalleryImages = [
  { src: '/images/IMG_9600.jpg', alt: 'Professional lawn mowing' },
  { src: '/images/img_002.jpg', alt: 'Professional lawn mowing' },
  { src: '/images/IMG_4863.jpg', alt: 'Trimmed bushes and landscaping' },
  { src: '/images/IMG_4864.jpg', alt: 'Mulch garden beds' },
  { src: '/images/IMG_4883.jpg', alt: 'Colorful flower garden' },
  { src: '/images/IMG_5158.jpg', alt: 'Tree trimming service' },
  { src: '/images/IMG_6134.jpg', alt: 'Manicured lawn' },
];

async function ensureDefaults() {
  await GalleryImage.sync();

  const count = await GalleryImage.count();
  if (count > 0) return;

  await GalleryImage.bulkCreate(
    defaultGalleryImages.map((image, index) => ({
      src: image.src,
      alt: image.alt,
      position: index + 1,
    }))
  );
}

function toPublicSrc(src, req) {
  if (!src) return src;
  if (!src.startsWith('/uploads/')) return src;
  return `${req.protocol}://${req.get('host')}${src}`;
}

function normalizeRow(row, req) {
  return {
    id: row.id,
    src: toPublicSrc(row.src, req),
    alt: row.alt,
    position: row.position,
    createdAt: row.createdAt,
  };
}

async function listGallery(req, res, next) {
  try {
    await ensureDefaults();

    const rows = await GalleryImage.findAll({
      order: [
        ['position', 'ASC'],
        ['id', 'ASC'],
      ],
    });

    return res.json({
      data: rows.map((row) => normalizeRow(row, req)),
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

    const maxPosition = (await GalleryImage.max('position')) || 0;
    const originalName = req.file.originalname.replace(/\.[^/.]+$/, '');

    const row = await GalleryImage.create({
      src: `/uploads/gallery/${req.file.filename}`,
      alt: req.body.alt?.trim() || originalName || 'Gallery image',
      position: maxPosition + 1,
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
  reorderGallery,
};
