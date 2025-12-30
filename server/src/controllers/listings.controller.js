const { prisma } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all listings with filters
 * GET /api/listings
 */
const getListings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    productType,
    status,
    minPrice,
    maxPrice,
    pinCode,
    search,
    ownerId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};

  // Only show approved listings for public queries
  if (!req.user?.isAdmin && !req.user?.isOwner) {
    where.status = 'approved';
    where.availability = true;
  } else if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  if (productType) {
    where.productType = productType;
  }

  if (ownerId) {
    where.ownerId = ownerId;
  }

  if (minPrice || maxPrice) {
    where.pricePerDay = {};
    if (minPrice) where.pricePerDay.gte = parseFloat(minPrice);
    if (maxPrice) where.pricePerDay.lte = parseFloat(maxPrice);
  }

  if (pinCode) {
    where.pinCode = pinCode;
  }

  if (search) {
    where.OR = [
      { productName: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            userType: true,
          },
        },
      },
      orderBy,
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
 * Get single listing by ID
 * GET /api/listings/:id
 */
const getListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          userType: true,
          businessName: true,
          phone: true,
        },
      },
    },
  });

  if (!listing) {
    return res.status(404).json({
      success: false,
      error: 'Listing not found',
    });
  }

  // Only show approved listings to non-owners
  if (listing.status !== 'approved' && listing.ownerId !== req.user?.id && !req.user?.isAdmin) {
    return res.status(404).json({
      success: false,
      error: 'Listing not found',
    });
  }

  res.json({
    success: true,
    data: listing,
  });
});

/**
 * Create a new listing
 * POST /api/listings
 */
const createListing = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const {
    productName,
    description,
    category,
    productType,
    pricePerDay,
    pricePerWeek,
    pricePerMonth,
    securityDeposit,
    images,
    pinCode,
    address,
    city,
    state,
    availability,
    availableFrom,
    availableTo,
    condition,
    brand,
    model,
    features,
    rules,
  } = req.body;

  // Validation
  if (!productName || !description || !category || !pricePerDay) {
    return res.status(400).json({
      success: false,
      error: 'Product name, description, category, and price per day are required',
    });
  }

  const listing = await prisma.listing.create({
    data: {
      ownerId,
      productName,
      description,
      category,
      productType: productType || 'rent',
      pricePerDay: parseFloat(pricePerDay),
      pricePerWeek: pricePerWeek ? parseFloat(pricePerWeek) : null,
      pricePerMonth: pricePerMonth ? parseFloat(pricePerMonth) : null,
      securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
      images: images || [],
      pinCode,
      address,
      city,
      state,
      availability: availability !== false,
      availableFrom: availableFrom ? new Date(availableFrom) : null,
      availableTo: availableTo ? new Date(availableTo) : null,
      condition,
      brand,
      model,
      features: features || [],
      rules: rules || [],
      status: 'pending', // All new listings start as pending
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: listing,
  });
});

/**
 * Update a listing
 * PUT /api/listings/:id
 */
const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const existing = await prisma.listing.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Listing not found',
    });
  }

  if (existing.ownerId !== userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this listing',
    });
  }

  const {
    productName,
    description,
    category,
    productType,
    pricePerDay,
    pricePerWeek,
    pricePerMonth,
    securityDeposit,
    images,
    pinCode,
    address,
    city,
    state,
    availability,
    availableFrom,
    availableTo,
    condition,
    brand,
    model,
    features,
    rules,
  } = req.body;

  const listing = await prisma.listing.update({
    where: { id },
    data: {
      ...(productName && { productName }),
      ...(description && { description }),
      ...(category && { category }),
      ...(productType && { productType }),
      ...(pricePerDay && { pricePerDay: parseFloat(pricePerDay) }),
      ...(pricePerWeek !== undefined && { pricePerWeek: pricePerWeek ? parseFloat(pricePerWeek) : null }),
      ...(pricePerMonth !== undefined && { pricePerMonth: pricePerMonth ? parseFloat(pricePerMonth) : null }),
      ...(securityDeposit !== undefined && { securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null }),
      ...(images && { images }),
      ...(pinCode !== undefined && { pinCode }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(availability !== undefined && { availability }),
      ...(availableFrom !== undefined && { availableFrom: availableFrom ? new Date(availableFrom) : null }),
      ...(availableTo !== undefined && { availableTo: availableTo ? new Date(availableTo) : null }),
      ...(condition !== undefined && { condition }),
      ...(brand !== undefined && { brand }),
      ...(model !== undefined && { model }),
      ...(features && { features }),
      ...(rules && { rules }),
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: listing,
  });
});

/**
 * Delete a listing
 * DELETE /api/listings/:id
 */
const deleteListing = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // Check ownership
  const existing = await prisma.listing.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Listing not found',
    });
  }

  if (existing.ownerId !== userId && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this listing',
    });
  }

  await prisma.listing.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Listing deleted successfully',
  });
});

/**
 * Increment listing views
 * POST /api/listings/:id/views
 */
const incrementViews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.listing.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });

  res.json({
    success: true,
    message: 'View counted',
  });
});

/**
 * Get listings by category
 * GET /api/listings/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.listing.groupBy({
    by: ['category'],
    where: {
      status: 'approved',
      availability: true,
    },
    _count: {
      category: true,
    },
  });

  res.json({
    success: true,
    data: categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    })),
  });
});

/**
 * Get listings ratings
 * GET /api/listings/:id/ratings
 */
const getListingRatings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [ratings, total, avgRating] = await Promise.all([
    prisma.rating.findMany({
      where: { listingId: id },
      skip,
      take: parseInt(limit),
      include: {
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
    prisma.rating.count({ where: { listingId: id } }),
    prisma.rating.aggregate({
      where: { listingId: id },
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
 * Add rating to listing
 * POST /api/listings/:id/ratings
 */
const addListingRating = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Rating must be between 1 and 5',
    });
  }

  // Check if listing exists
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!listing) {
    return res.status(404).json({
      success: false,
      error: 'Listing not found',
    });
  }

  // Can't rate own listing
  if (listing.ownerId === userId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot rate your own listing',
    });
  }

  // Upsert rating
  const ratingRecord = await prisma.rating.upsert({
    where: {
      listingId_raterId: {
        listingId: id,
        raterId: userId,
      },
    },
    create: {
      listingId: id,
      raterId: userId,
      ownerId: listing.ownerId,
      rating: parseInt(rating),
      review,
    },
    update: {
      rating: parseInt(rating),
      review,
    },
    include: {
      rater: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  res.json({
    success: true,
    data: ratingRecord,
  });
});

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  incrementViews,
  getCategories,
  getListingRatings,
  addListingRating,
};
