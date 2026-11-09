const { Testimonial } = require('../../db/models');

// Testimonios pre-cargados (se insertan si la tabla está vacía)
const defaultTestimonials = [
  {
    name: 'Lisa Johnson',
    rating: 5,
    text: 'Highly recommend them very professional and came the same day my grass got very high and it was hard to find someone but they came and saved the day great price and my yard looks very good. I will start using their service now for good and I appreciate them. Im very picky and Im grateful I found this company. Thank you!!!',
    location: 'Memphis, TN',
    service: 'General Lawn Service',
    approved: true,
  },
  {
    name: 'Michael Carter',
    rating: 5,
    text: 'They transformed my overgrown bushes into something beautiful. Very happy with the results and the price was fair.',
    location: 'Cordova, TN',
    service: 'Bush & Trees Trimming',
    approved: true,
  },
  {
    name: 'Linda Torres',
    rating: 4,
    text: 'Great job with the mulching. The garden looks clean and fresh. Will definitely call them again next season.',
    location: 'Bartlett, TN',
    service: 'Mulching',
    approved: true,
  },
  {
    name: 'James Williams',
    rating: 5,
    text: 'Fast, efficient and left everything spotless. Highly recommend Memphis Lawn Service to anyone in the area.',
    location: 'Germantown, TN',
    service: 'Leaves Cleaning & More',
    approved: true,
  },
  {
    name: 'Patricia Moore',
    rating: 5,
    text: 'They planted the most gorgeous flower arrangement in my front yard. My neighbors keep asking who did the work!',
    location: 'Collierville, TN',
    service: 'Flowers',
    approved: true,
  },
];

async function ensureDefaults() {
  await Testimonial.sync({ alter: true });

  // Auto-aprobar cualquier testimonio previo para que se muestre inmediatamente
  try {
    await Testimonial.update({ approved: true }, { where: { approved: false } });
  } catch (updateErr) {
    console.warn('[ENSURE_DEFAULTS] Warning updating testimonials:', updateErr.message);
  }

  const count = await Testimonial.count();
  if (count > 0) return;

  await Testimonial.bulkCreate(defaultTestimonials);
}

/**
 * GET /api/testimonials
 * Retorna únicamente los testimonios aprobados (visibles al público)
 */
async function listTestimonials(req, res, next) {
  try {
    await ensureDefaults();

    const rows = await Testimonial.findAll({
      where: { approved: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'name', 'location', 'service', 'text', 'rating', 'createdAt'],
    });

    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/testimonials
 * Crea un testimonio público (pending approval, approved = false)
 */
async function createTestimonial(req, res, next) {
  try {
    // Garantizamos que la tabla exista antes de insertar
    await ensureDefaults();

    const { name, location, service, text, rating } = req.body;

    const row = await Testimonial.create({
      name: name.trim(),
      location: location.trim(),
      service: service.trim(),
      text: text.trim(),
      rating: Number(rating) || 5,
      approved: true, // Se publica inmediatamente
    });

    return res.status(201).json({
      message: 'Testimonial submitted and published successfully!',
      data: {
        id: row.id,
        name: row.name,
        location: row.location,
        service: row.service,
        text: row.text,
        rating: row.rating,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/testimonials/admin
 * Lista TODOS los testimonios (aprobados y pendientes) — solo admin
 */
async function listAllTestimonials(req, res, next) {
  try {
    await ensureDefaults();

    const rows = await Testimonial.findAll({
      order: [['createdAt', 'DESC']],
    });

    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
}

/**
 * PATCH /api/testimonials/:id/approve
 * Aprueba un testimonio — solo admin
 */
async function approveTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const testimonialId = Number(id);

    if (!Number.isFinite(testimonialId) || testimonialId < 1) {
      return res.status(400).json({ message: 'Invalid testimonial id' });
    }

    const row = await Testimonial.findByPk(testimonialId);
    if (!row) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await row.update({ approved: true });

    return res.json({ message: 'Testimonial approved', data: row });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/testimonials/:id
 * Elimina un testimonio — solo admin
 */
async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const testimonialId = Number(id);

    if (!Number.isFinite(testimonialId) || testimonialId < 1) {
      return res.status(400).json({ message: 'Invalid testimonial id' });
    }

    const row = await Testimonial.findByPk(testimonialId);
    if (!row) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await row.destroy();

    return res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTestimonials,
  createTestimonial,
  listAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
};
