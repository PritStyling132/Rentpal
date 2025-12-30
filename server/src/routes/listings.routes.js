const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listings.controller');
const { authenticate, requireOwner, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/categories', listingsController.getCategories);
router.get('/', optionalAuth, listingsController.getListings);
router.get('/:id', optionalAuth, listingsController.getListing);
router.get('/:id/ratings', listingsController.getListingRatings);
router.post('/:id/views', listingsController.incrementViews);

// Protected routes - require owner or admin
router.post('/', authenticate, requireOwner, listingsController.createListing);
router.put('/:id', authenticate, listingsController.updateListing);
router.delete('/:id', authenticate, listingsController.deleteListing);
router.post('/:id/ratings', authenticate, listingsController.addListingRating);

module.exports = router;
