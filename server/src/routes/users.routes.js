const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/leaderboard', usersController.getLeaderboard);
router.get('/top-profiles', usersController.getTopProfiles);
router.get('/online-status', optionalAuth, usersController.getOnlineStatus);

// Protected routes
router.get('/me/notifications', authenticate, usersController.getNotifications);
router.put('/me/notifications/read-all', authenticate, usersController.markAllNotificationsRead);
router.put('/me/notifications/:id/read', authenticate, usersController.markNotificationRead);
router.put('/me', authenticate, usersController.updateProfile);

// Admin routes
router.get('/', authenticate, requireAdmin, usersController.getAllProfiles);

// Public profile view (must be after specific routes)
router.get('/:id', optionalAuth, usersController.getProfile);

module.exports = router;
