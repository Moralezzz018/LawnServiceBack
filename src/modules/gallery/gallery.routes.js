const { Router } = require('express');
const authOwner = require('../../middlewares/authOwner');
const validateRequest = require('../../middlewares/validateRequest');
const uploadGallery = require('../../middlewares/uploadGallery');
const { reorderGalleryRules } = require('./gallery.validators');
const {
  listGallery,
  uploadGalleryImage,
  deleteGalleryImage,
  reorderGallery,
} = require('./gallery.controller');

const router = Router();

router.get('/', listGallery);

router.post('/', authOwner, uploadGallery.single('image'), uploadGalleryImage);
router.delete('/:id', authOwner, deleteGalleryImage);
router.put('/reorder', authOwner, reorderGalleryRules, validateRequest, reorderGallery);

module.exports = router;
