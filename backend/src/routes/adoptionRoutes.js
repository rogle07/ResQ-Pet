const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  listPetForAdoption,
  browseAdoptablePets,
  applyForAdoption,
  getAdoptions,
  decideAdoption,
} = require('../controllers/adoptionController');

const router = express.Router();

// Public browsing of adoptable pets
router.get('/pets', browseAdoptablePets);

router.use(protect);

router.put('/pets/:petId/list', authorize('owner', 'ngo', 'admin'), listPetForAdoption);

router.post(
  '/apply',
  [body('petId').notEmpty().withMessage('petId is required')],
  validate,
  applyForAdoption
);

router.get('/', getAdoptions);
router.put(
  '/:id/decision',
  authorize('ngo', 'admin'),
  [body('decision').isIn(['approved', 'rejected']).withMessage('decision must be approved or rejected')],
  validate,
  decideAdoption
);

module.exports = router;
