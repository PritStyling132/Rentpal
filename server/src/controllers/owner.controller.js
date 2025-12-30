const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get owner dashboard stats
 * GET /api/owner/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  const [
    totalListings,
    activeListings,
    pendingListings,
    totalRentalRequests,
    pendingRequests,
    totalViews,
    avgRating,
    totalEarnings,
  ] = await Promise.all([
    prisma.listing.count({ where: { ownerId } }),
    prisma.listing.count({ where: { ownerId, status: 'approved', availability: true } }),
    prisma.listing.count({ where: { ownerId, status: 'pending' } }),
    prisma.rentalRequest.count({
      where: { listing: { ownerId } },
    }),
    prisma.rentalRequest.count({
      where: { listing: { ownerId }, status: 'pending' },
    }),
    prisma.listing.aggregate({
      where: { ownerId },
      _sum: { views: true },
    }),
    prisma.rating.aggregate({
      where: { ownerId },
      _avg: { rating: true },
    }),
    prisma.ownerEarnings.aggregate({
      where: { ownerId },
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalListings,
      activeListings,
      pendingListings,
      totalRentalRequests,
      pendingRequests,
      totalViews: totalViews._sum.views || 0,
      averageRating: avgRating._avg.rating || 0,
      totalEarnings: totalEarnings._sum.amount || 0,
    },
  });
});

/**
 * Get owner's listings
 * GET /api/owner/listings
 */
const getOwnerListings = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { ownerId };
  if (status) {
    where.status = status;
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({
    success: true,
    data: listings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get rental requests for owner
 * GET /api/owner/rental-requests
 */
const getRentalRequests = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { page = 1, limit = 20, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {
    listing: { ownerId },
  };
  if (status) {
    where.status = status;
  }

  const [requests, total] = await Promise.all([
    prisma.rentalRequest.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        listing: {
          select: {
            id: true,
            productName: true,
            images: true,
            pricePerDay: true,
          },
        },
        requester: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            phone: true,
          },
        },
        identityVerification: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rentalRequest.count({ where }),
  ]);

  res.json({
    success: true,
    data: requests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get single rental request
 * GET /api/owner/rental-requests/:id
 */
const getRentalRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;

  const request = await prisma.rentalRequest.findFirst({
    where: {
      id,
      listing: { ownerId },
    },
    include: {
      listing: true,
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          phone: true,
          user: {
            select: { email: true },
          },
        },
      },
      identityVerification: true,
    },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      error: 'Rental request not found',
    });
  }

  res.json({
    success: true,
    data: request,
  });
});

/**
 * Update rental request status
 * PUT /api/owner/rental-requests/:id
 */
const updateRentalRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;
  const { status, rejectionReason } = req.body;

  // Verify ownership
  const existing = await prisma.rentalRequest.findFirst({
    where: {
      id,
      listing: { ownerId },
    },
    include: {
      listing: {
        select: { productName: true },
      },
      requester: {
        select: { id: true },
      },
    },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Rental request not found',
    });
  }

  const validStatuses = ['pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status',
    });
  }

  const request = await prisma.rentalRequest.update({
    where: { id },
    data: {
      status,
      ...(status === 'rejected' && rejectionReason && { rejectionReason }),
    },
    include: {
      listing: {
        select: {
          id: true,
          productName: true,
          images: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  // Create notification for requester
  await prisma.notification.create({
    data: {
      userId: existing.requester.id,
      type: 'rental_request_update',
      title: `Rental Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your rental request for "${existing.listing.productName}" has been ${status}`,
      data: { rentalRequestId: id, status },
    },
  });

  // Log activity
  await prisma.ownerActivityLog.create({
    data: {
      ownerId,
      action: `RENTAL_REQUEST_${status.toUpperCase()}`,
      details: { rentalRequestId: id, status },
    },
  });

  res.json({
    success: true,
    data: request,
  });
});

/**
 * Verify identity document
 * PUT /api/owner/identity-verification/:id
 */
const verifyIdentity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ownerId = req.user.id;
  const { status, rejectionReason } = req.body;

  // Verify the verification belongs to a rental request for this owner
  const verification = await prisma.identityVerification.findFirst({
    where: {
      id,
      rentalRequest: {
        listing: { ownerId },
      },
    },
    include: {
      rentalRequest: {
        include: {
          listing: { select: { productName: true } },
          requester: { select: { id: true } },
        },
      },
    },
  });

  if (!verification) {
    return res.status(404).json({
      success: false,
      error: 'Verification not found',
    });
  }

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status',
    });
  }

  const updatedVerification = await prisma.identityVerification.update({
    where: { id },
    data: {
      verificationStatus: status,
      ...(status === 'rejected' && rejectionReason && { rejectionReason }),
      verifiedAt: status === 'approved' ? new Date() : null,
      verifiedBy: status === 'approved' ? ownerId : null,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId: verification.rentalRequest.requester.id,
      type: 'identity_verification_update',
      title: `Identity Verification ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message:
        status === 'approved'
          ? 'Your identity has been verified successfully'
          : `Your identity verification was rejected: ${rejectionReason || 'Please resubmit'}`,
      data: { verificationId: id, status },
    },
  });

  res.json({
    success: true,
    data: updatedVerification,
  });
});

/**
 * Get owner's ratings
 * GET /api/owner/ratings
 */
const getOwnerRatings = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [ratings, total, avgRating] = await Promise.all([
    prisma.rating.findMany({
      where: { ownerId },
      skip,
      take: parseInt(limit),
      include: {
        listing: {
          select: {
            id: true,
            productName: true,
            images: true,
          },
        },
        rater: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.count({ where: { ownerId } }),
    prisma.rating.aggregate({
      where: { ownerId },
      _avg: { rating: true },
    }),
  ]);

  res.json({
    success: true,
    data: ratings,
    averageRating: avgRating._avg.rating || 0,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get owner earnings
 * GET /api/owner/earnings
 */
const getEarnings = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { page = 1, limit = 20, startDate, endDate } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { ownerId };
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [earnings, total, totalAmount] = await Promise.all([
    prisma.ownerEarnings.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        listing: {
          select: {
            id: true,
            productName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ownerEarnings.count({ where }),
    prisma.ownerEarnings.aggregate({
      where,
      _sum: { amount: true },
    }),
  ]);

  res.json({
    success: true,
    data: earnings,
    totalAmount: totalAmount._sum.amount || 0,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Get owner activity logs
 * GET /api/owner/activity-logs
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { page = 1, limit = 50 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [logs, total] = await Promise.all([
    prisma.ownerActivityLog.findMany({
      where: { ownerId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ownerActivityLog.count({ where: { ownerId } }),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

module.exports = {
  getStats,
  getOwnerListings,
  getRentalRequests,
  getRentalRequest,
  updateRentalRequest,
  verifyIdentity,
  getOwnerRatings,
  getEarnings,
  getActivityLogs,
};
