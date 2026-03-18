const { Router } = require('express');
const authRoutes = require('./modules/auth/auth.routes');
const appointmentsRoutes = require('./modules/appointments/appointments.routes');
const quotesRoutes = require('./modules/quotes/quotes.routes');
const servicePricesRoutes = require('./modules/service-prices/service-prices.routes');
const galleryRoutes = require('./modules/gallery/gallery.routes');

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'lawn-service-back',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/appointments', appointmentsRoutes);
router.use('/quotes', quotesRoutes);
router.use('/service-prices', servicePricesRoutes);
router.use('/gallery', galleryRoutes);

module.exports = router;
