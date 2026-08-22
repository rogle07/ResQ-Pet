const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createPet,
  getMyPets,
  getPetById,
  getPublicPetProfile,
  updatePet,
  deletePet,
  addVaccination,
  setSafeZone,
  markPetLost,
  markPetSafe,
} = require('../controllers/petController');

const router = express.Router();

// Public QR-scan profile
router.get('/public/:petId', getPublicPetProfile);

router.use(protect);

router.post(
  '/',
  authorize('owner', 'admin'),
  upload.array('images', 6),
  [
    body('name').trim().notEmpty().withMessage('Pet name is required'),
    body('species').isIn(['dog', 'cat', 'bird', 'other']).withMessage('Valid species is required'),
  ],
  validate,
  createPet
);

router.get('/', authorize('owner', 'admin'), getMyPets);
router.get('/:id', getPetById);
router.put('/:id', upload.array('images', 6), updatePet);
router.delete('/:id', deletePet);

router.post(
  '/:id/vaccinations',
  [body('name').trim().notEmpty().withMessage('Vaccination name is required')],
  validate,
  addVaccination
);

router.put('/:id/safe-zone', setSafeZone);
router.post('/:id/mark-lost', markPetLost);
router.post('/:id/mark-safe', markPetSafe);

module.exports = router;
