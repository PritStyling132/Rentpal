const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get admin dashboard stats
 * GET /api/admin/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOwners,
    totalListings,
    pendingListings,
    approvedListings,
    totalRentalRequests,
    totalBlogs,
    totalActiveAds,
    totalRevenue,
  ] = await Promise.all([
    prisma.profile.count({ where: { userType: 'user' } }),
    prisma.profile.count({ where: { userType: 'owner' } }),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'pending' } }),
    prisma.listing.count({ where: { status: 'approved' } }),
    prisma.rentalRequest.count(),
    prisma.blog.count({ where: { isPublished: true } }),
    prisma.ad.count({ where: { isActive: true } }),
    prisma.ownerEarnings.aggregate({ _sum: { amount: true } }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalOwners,
      totalListings,
      pendingListings,
      approvedListings,
      totalRentalRequests,
      totalBlogs,
      totalActiveAds,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
  });
});

// ============= LISTINGS MANAGEMENT =============

/**
 * Get all listings (admin view)
 * GET /api/admin/listings
 */
const getAllListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { productName: { contains: search, mode: 'insensitive' } },
      { owner: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
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
 * Update listing status (approve/reject)
 * PUT /api/admin/listings/:id/status
 */
const updateListingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be pending, approved, or rejected',
    });
  }

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      status,
      ...(status === 'rejected' && rejectionReason && { rejectionReason }),
    },
    include: {
      owner: { select: { id: true, name: true } },
    },
  });

  // Create notification for owner
  await prisma.notification.create({
    data: {
      userId: listing.owner.id,
      type: 'listing_status_update',
      title: `Listing ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message:
        status === 'approved'
          ? `Your listing "${listing.productName}" has been approved`
          : `Your listing "${listing.productName}" was rejected: ${rejectionReason || 'Please review and resubmit'}`,
      data: { listingId: id, status },
    },
  });

  // Log admin activity
  await prisma.adminActivityLog.create({
    data: {
      adminId: req.user.id,
      action: `LISTING_${status.toUpperCase()}`,
      targetType: 'listing',
      targetId: id,
      details: { status, rejectionReason },
    },
  });

  res.json({
    success: true,
    data: listing,
  });
});

// ============= BLOGS MANAGEMENT =============

/**
 * Get all blogs
 * GET /api/admin/blogs
 */
const getBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, published } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (published !== undefined) {
    where.isPublished = published === 'true';
  }

  const [blogs, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.blog.count({ where }),
  ]);

  res.json({
    success: true,
    data: blogs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Create blog
 * POST /api/admin/blogs
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, slug, content, excerpt, featuredImage, tags, category, isPublished } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: 'Title and content are required',
    });
  }

  const blog = await prisma.blog.create({
    data: {
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
      content,
      excerpt,
      featuredImage,
      tags: tags || [],
      category,
      isPublished: isPublished || false,
      authorId: req.user.id,
      publishedAt: isPublished ? new Date() : null,
    },
  });

  res.status(201).json({
    success: true,
    data: blog,
  });
});

/**
 * Update blog
 * PUT /api/admin/blogs/:id
 */
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, slug, content, excerpt, featuredImage, tags, category, isPublished } = req.body;

  const existing = await prisma.blog.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Blog not found',
    });
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(content && { content }),
      ...(excerpt !== undefined && { excerpt }),
      ...(featuredImage !== undefined && { featuredImage }),
      ...(tags && { tags }),
      ...(category !== undefined && { category }),
      ...(isPublished !== undefined && {
        isPublished,
        publishedAt: isPublished && !existing.isPublished ? new Date() : existing.publishedAt,
      }),
    },
  });

  res.json({
    success: true,
    data: blog,
  });
});

/**
 * Delete blog
 * DELETE /api/admin/blogs/:id
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.blog.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Blog deleted successfully',
  });
});

// ============= ADS MANAGEMENT =============

/**
 * Get all ads
 * GET /api/admin/ads
 */
const getAds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, isActive } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (isActive !== undefined) {
    where.isActive = isActive === 'true';
  }

  const [ads, total] = await Promise.all([
    prisma.ad.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ad.count({ where }),
  ]);

  res.json({
    success: true,
    data: ads,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Create ad
 * POST /api/admin/ads
 */
const createAd = asyncHandler(async (req, res) => {
  const { title, imageUrl, linkUrl, placement, displayOrder, isActive, startDate, endDate } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title and image URL are required',
    });
  }

  const ad = await prisma.ad.create({
    data: {
      title,
      imageUrl,
      linkUrl,
      placement: placement || 'sidebar',
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  res.status(201).json({
    success: true,
    data: ad,
  });
});

/**
 * Update ad
 * PUT /api/admin/ads/:id
 */
const updateAd = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, imageUrl, linkUrl, placement, displayOrder, isActive, startDate, endDate } = req.body;

  const ad = await prisma.ad.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(imageUrl && { imageUrl }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(placement && { placement }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
      ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    },
  });

  res.json({
    success: true,
    data: ad,
  });
});

/**
 * Delete ad
 * DELETE /api/admin/ads/:id
 */
const deleteAd = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.ad.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Ad deleted successfully',
  });
});

// ============= BANNERS MANAGEMENT =============

/**
 * Get all banners
 * GET /api/admin/banners
 */
const getBanners = asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: banners,
  });
});

/**
 * Create banner
 * POST /api/admin/banners
 */
const createBanner = asyncHandler(async (req, res) => {
  const { title, imageUrl, linkUrl, displayOrder, isActive } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      error: 'Image URL is required',
    });
  }

  const banner = await prisma.banner.create({
    data: {
      title,
      imageUrl,
      linkUrl,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    },
  });

  res.status(201).json({
    success: true,
    data: banner,
  });
});

/**
 * Update banner
 * PUT /api/admin/banners/:id
 */
const updateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, imageUrl, linkUrl, displayOrder, isActive } = req.body;

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(imageUrl && { imageUrl }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: banner,
  });
});

/**
 * Delete banner
 * DELETE /api/admin/banners/:id
 */
const deleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.banner.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Banner deleted successfully',
  });
});

// ============= PACKAGES MANAGEMENT =============

/**
 * Get all packages
 * GET /api/admin/packages
 */
const getPackages = asyncHandler(async (req, res) => {
  const packages = await prisma.package.findMany({
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: packages,
  });
});

/**
 * Create package
 * POST /api/admin/packages
 */
const createPackage = asyncHandler(async (req, res) => {
  const { name, description, price, duration, features, listingsLimit, boostDays, displayOrder, isActive } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Name and price are required',
    });
  }

  const pkg = await prisma.package.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      duration: duration || 30,
      features: features || [],
      listingsLimit,
      boostDays,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    },
  });

  res.status(201).json({
    success: true,
    data: pkg,
  });
});

/**
 * Update package
 * PUT /api/admin/packages/:id
 */
const updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, duration, features, listingsLimit, boostDays, displayOrder, isActive } = req.body;

  const pkg = await prisma.package.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(duration !== undefined && { duration }),
      ...(features && { features }),
      ...(listingsLimit !== undefined && { listingsLimit }),
      ...(boostDays !== undefined && { boostDays }),
      ...(displayOrder !== undefined && { displayOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: pkg,
  });
});

/**
 * Delete package
 * DELETE /api/admin/packages/:id
 */
const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.package.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Package deleted successfully',
  });
});

// ============= COUPONS MANAGEMENT =============

/**
 * Get all coupons
 * GET /api/admin/coupons
 */
const getCoupons = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.coupon.count(),
  ]);

  res.json({
    success: true,
    data: coupons,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * Create coupon
 * POST /api/admin/coupons
 */
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, minPurchase, maxDiscount, usageLimit, validFrom, validUntil, isActive } =
    req.body;

  if (!code || !discountType || discountValue === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Code, discount type, and discount value are required',
    });
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: minPurchase ? parseFloat(minPurchase) : null,
      maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
      usageLimit,
      validFrom: validFrom ? new Date(validFrom) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive: isActive !== false,
    },
  });

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

/**
 * Update coupon
 * PUT /api/admin/coupons/:id
 */
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { code, discountType, discountValue, minPurchase, maxDiscount, usageLimit, validFrom, validUntil, isActive } =
    req.body;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(code && { code: code.toUpperCase() }),
      ...(discountType && { discountType }),
      ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
      ...(minPurchase !== undefined && { minPurchase: minPurchase ? parseFloat(minPurchase) : null }),
      ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
      ...(usageLimit !== undefined && { usageLimit }),
      ...(validFrom !== undefined && { validFrom: validFrom ? new Date(validFrom) : null }),
      ...(validUntil !== undefined && { validUntil: validUntil ? new Date(validUntil) : null }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  res.json({
    success: true,
    data: coupon,
  });
});

/**
 * Delete coupon
 * DELETE /api/admin/coupons/:id
 */
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.coupon.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

// ============= USER MANAGEMENT =============

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, action } = req.body; // action: 'add' or 'remove'

  const validRoles = ['user', 'owner', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role',
    });
  }

  if (action === 'add') {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: id, role } },
      create: { userId: id, role },
      update: {},
    });
  } else if (action === 'remove') {
    await prisma.userRole.deleteMany({
      where: { userId: id, role },
    });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      userRoles: true,
    },
  });

  // Log admin activity
  await prisma.adminActivityLog.create({
    data: {
      adminId: req.user.id,
      action: `USER_ROLE_${action.toUpperCase()}`,
      targetType: 'user',
      targetId: id,
      details: { role, action },
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Get admin activity logs
 * GET /api/admin/activity-logs
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, action, targetType } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (action) where.action = { contains: action, mode: 'insensitive' };
  if (targetType) where.targetType = targetType;

  const [logs, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        admin: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.adminActivityLog.count({ where }),
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

/**
 * Get section visibility settings
 * GET /api/admin/section-visibility
 */
const getSectionVisibility = asyncHandler(async (req, res) => {
  const sections = await prisma.sectionVisibility.findMany({
    orderBy: { sectionName: 'asc' },
  });

  res.json({
    success: true,
    data: sections,
  });
});

/**
 * Update section visibility
 * PUT /api/admin/section-visibility/:id
 */
const updateSectionVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVisible } = req.body;

  const section = await prisma.sectionVisibility.update({
    where: { id },
    data: { isVisible },
  });

  res.json({
    success: true,
    data: section,
  });
});

/**
 * Manage top profiles
 * POST /api/admin/top-profiles
 */
const addTopProfile = asyncHandler(async (req, res) => {
  const { profileId, displayOrder, isActive } = req.body;

  const topProfile = await prisma.topProfile.upsert({
    where: { profileId },
    create: {
      profileId,
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    },
    update: {
      displayOrder: displayOrder || 0,
      isActive: isActive !== false,
    },
  });

  res.json({
    success: true,
    data: topProfile,
  });
});

/**
 * Remove top profile
 * DELETE /api/admin/top-profiles/:id
 */
const removeTopProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.topProfile.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Top profile removed',
  });
});

/**
 * Manage leaderboard
 * PUT /api/admin/leaderboard
 */
const updateLeaderboard = asyncHandler(async (req, res) => {
  const { entries } = req.body; // Array of { profileId, rank, score, category }

  // Clear existing and recreate
  await prisma.$transaction([
    prisma.leaderboard.deleteMany(),
    prisma.leaderboard.createMany({
      data: entries.map((entry) => ({
        profileId: entry.profileId,
        rank: entry.rank,
        score: entry.score || 0,
        category: entry.category,
      })),
    }),
  ]);

  const leaderboard = await prisma.leaderboard.findMany({
    include: {
      profile: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { rank: 'asc' },
  });

  res.json({
    success: true,
    data: leaderboard,
  });
});

module.exports = {
  getStats,
  getAllListings,
  updateListingStatus,
  getBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getAds,
  createAd,
  updateAd,
  deleteAd,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  updateUserRole,
  getActivityLogs,
  getSectionVisibility,
  updateSectionVisibility,
  addTopProfile,
  removeTopProfile,
  updateLeaderboard,
};
