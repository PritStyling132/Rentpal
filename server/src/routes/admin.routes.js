const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

// Dashboard
router.get('/stats', adminController.getStats);

// Listings management
router.get('/listings', adminController.getAllListings);
router.put('/listings/:id/status', adminController.updateListingStatus);

// Blogs management
router.get('/blogs', adminController.getBlogs);
router.post('/blogs', adminController.createBlog);
router.put('/blogs/:id', adminController.updateBlog);
router.delete('/blogs/:id', adminController.deleteBlog);

// Ads management
router.get('/ads', adminController.getAds);
router.post('/ads', adminController.createAd);
router.put('/ads/:id', adminController.updateAd);
router.delete('/ads/:id', adminController.deleteAd);

// Banners management
router.get('/banners', adminController.getBanners);
router.post('/banners', adminController.createBanner);
router.put('/banners/:id', adminController.updateBanner);
router.delete('/banners/:id', adminController.deleteBanner);

// Packages management
router.get('/packages', adminController.getPackages);
router.post('/packages', adminController.createPackage);
router.put('/packages/:id', adminController.updatePackage);
router.delete('/packages/:id', adminController.deletePackage);

// Coupons management
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// User management
router.put('/users/:id/role', adminController.updateUserRole);

// Activity logs
router.get('/activity-logs', adminController.getActivityLogs);

// Section visibility
router.get('/section-visibility', adminController.getSectionVisibility);
router.put('/section-visibility/:id', adminController.updateSectionVisibility);

// Top profiles
router.post('/top-profiles', adminController.addTopProfile);
router.delete('/top-profiles/:id', adminController.removeTopProfile);

// Leaderboard
router.put('/leaderboard', adminController.updateLeaderboard);

module.exports = router;
