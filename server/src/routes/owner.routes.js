const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const { authenticate, requireOwner } = require('../middleware/auth');

// All routes require authentication and owner role
router.use(authenticate);
router.use(requireOwner);

// Dashboard
router.get('/stats', ownerController.getStats);

// Listings
router.get('/listings', ownerController.getOwnerListings);

// Rental requests
router.get('/rental-requests', ownerController.getRentalRequests);
router.get('/rental-requests/:id', ownerController.getRentalRequest);
router.put('/rental-requests/:id', ownerController.updateRentalRequest);

// Identity verification
router.put('/identity-verification/:id', ownerController.verifyIdentity);

// Ratings
router.get('/ratings', ownerController.getOwnerRatings);

// Earnings
router.get('/earnings', ownerController.getEarnings);

// Activity logs
router.get('/activity-logs', ownerController.getActivityLogs);

module.exports = router;
