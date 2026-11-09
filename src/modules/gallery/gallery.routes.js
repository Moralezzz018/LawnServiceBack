const { Router } = require('express');
const authOwner = require('../../middlewares/authOwner');
const validateRequest = require('../../middlewares/validateRequest');
const uploadGallery = require('../../middlewares/uploadGallery');
const { reorderGalleryRules } = require('./gallery.validators');
const {
  listGallery,
  getGalleryImageBlob,
  uploadGalleryImage,
  deleteGalleryImage,
  reorderGallery,
  resetGalleryDefaults,
} = require('./gallery.controller');

const router = Router();

// Rutas públicas
router.get('/', listGallery);
router.get('/image/:id', getGalleryImageBlob);

// Rutas protegidas (admin)
router.post('/', authOwner, uploadGallery.single('image'), uploadGalleryImage);
router.delete('/:id', authOwner, deleteGalleryImage);
router.put('/reorder', authOwner, reorderGalleryRules, validateRequest, reorderGallery);
router.post('/reset-defaults', authOwner, resetGalleryDefaults);

module.exports = router;
