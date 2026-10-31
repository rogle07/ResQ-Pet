const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listListings,
  createListing,
  myListings,
  getListing,
  applyForAdoption,
  myRequests,
  receivedRequests,
  updateRequest,
} = require('../controllers/adoptionListingController');

router.get('/', listListings);
router.get('/my', protect, myListings);
router.get('/my-requests', protect, myRequests);
router.get('/received-requests', protect, receivedRequests);
router.get('/:id', getListing);
router.post('/', protect, createListing);
router.post('/:id/apply', protect, applyForAdoption);
router.patch('/requests/:requestId', protect, updateRequest);

module.exports = router;
