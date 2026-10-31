const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReport,
  listReports,
  myReports,
  myMatches,
  finderMatches,
  getReport,
  updateStatus,
  closeReport,
  verifyMatch,
  matchFound,
} = require('../controllers/lostPetController');

router.get('/', listReports);
router.get('/my', protect, myReports);
router.get('/my-matches', protect, myMatches);
router.get('/finder-matches', protect, finderMatches);
router.get('/:id', getReport);
router.post('/', protect, createReport);
router.patch('/:id/status', protect, updateStatus);
router.patch('/:id/close', protect, closeReport);
router.patch('/:id/verify-match', protect, verifyMatch);
router.post('/match/:foundReportId', protect, matchFound);

module.exports = router;
