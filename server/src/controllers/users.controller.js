const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get user profile
 * GET /api/users/:id
 */
const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          emailVerified: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    return res.status(404).json({
      success: false,
      error: 'Profile not found',
    });
  }

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * Update current user's profile
 * PUT /api/users/me
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, phone, pinCode, avatarUrl, bio, address, city, state, country } = req.body;

  const profile = await prisma.profile.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(pinCode !== undefined && { pinCode }),
      ...(avatarUrl !== undefined && { avatarUrl }),
      ...(bio !== undefined && { bio }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(country !== undefined && { country }),
    },
  });

  res.json({
    success: true,
    data: profile,
  });
});

/**
 * Get all profiles (admin only)
 * GET /api/users
 */
const getAllProfiles = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userType, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  if (userType) {
    where.userType = userType;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [profiles, total] = await Promise.all([
    prisma.profile.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            createdAt: true,
          },
        },
        userRoles: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.count({ where }),
  ]);

  res.json({
    success: true,
    data: profiles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get online status for users
 * GET /api/users/online-status
 */
const getOnlineStatus = asyncHandler(async (req, res) => {
  const { userIds } = req.query;

  if (!userIds) {
    return res.status(400).json({
      success: false,
      error: 'userIds query parameter is required',
    });
  }

  const ids = userIds.split(',');

  const statuses = await prisma.onlineStatus.findMany({
    where: {
      userId: { in: ids },
    },
  });

  const statusMap = {};
  statuses.forEach((status) => {
    statusMap[status.userId] = {
      isOnline: status.isOnline,
      lastSeen: status.lastSeen,
    };
  });

  res.json({
    success: true,
    data: statusMap,
  });
});

/**
 * Get leaderboard
 * GET /api/users/leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await prisma.leaderboard.findMany({
    include: {
      profile: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          userType: true,
        },
      },
    },
    orderBy: { rank: 'asc' },
    take: 100,
  });

  res.json({
    success: true,
    data: leaderboard,
  });
});

/**
 * Get top profiles
 * GET /api/users/top-profiles
 */
const getTopProfiles = asyncHandler(async (req, res) => {
  const topProfiles = await prisma.topProfile.findMany({
    where: { isActive: true },
    include: {
      profile: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          userType: true,
          businessName: true,
        },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: topProfiles,
  });
});

/**
 * Get user notifications
 * GET /api/users/me/notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { userId };
  if (unreadOnly === 'true') {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Mark notification as read
 * PUT /api/users/me/notifications/:id/read
 */
const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  await prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * Mark all notifications as read
 * PUT /api/users/me/notifications/read-all
 */
const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getAllProfiles,
  getOnlineStatus,
  getLeaderboard,
  getTopProfiles,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
