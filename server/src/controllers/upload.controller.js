const cloudinaryService = require('../services/cloudinary.service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Upload single image
 * POST /api/upload/image
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const { folder = 'listings' } = req.body;

  const result = await cloudinaryService.uploadFile(req.file.buffer, {
    folder,
  });

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Upload multiple images
 * POST /api/upload/images
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded',
    });
  }

  const { folder = 'listings' } = req.body;

  const results = await cloudinaryService.uploadMultiple(req.files, {
    folder,
  });

  res.json({
    success: true,
    data: results,
  });
});

/**
 * Upload avatar
 * POST /api/upload/avatar
 */
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const result = await cloudinaryService.uploadAvatar(req.file.buffer, req.user.id);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Upload listing images
 * POST /api/upload/listing/:listingId
 */
const uploadListingImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No files uploaded',
    });
  }

  const { listingId } = req.params;

  const results = await cloudinaryService.uploadListingImages(req.files, listingId);

  res.json({
    success: true,
    data: results,
  });
});

/**
 * Upload identity document
 * POST /api/upload/identity/:rentalRequestId
 */
const uploadIdentityDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const { rentalRequestId } = req.params;

  const result = await cloudinaryService.uploadIdentityDocument(
    req.file.buffer,
    req.user.id,
    rentalRequestId
  );

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Upload chat media
 * POST /api/upload/chat/:conversationId
 */
const uploadChatMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const { conversationId } = req.params;

  const result = await cloudinaryService.uploadChatMedia(req.file.buffer, conversationId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Upload blog image
 * POST /api/upload/blog/:blogId
 */
const uploadBlogImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const { blogId } = req.params;

  const result = await cloudinaryService.uploadBlogImage(req.file.buffer, blogId);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Upload ad/banner image
 * POST /api/upload/ad
 */
const uploadAdImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded',
    });
  }

  const { type = 'ad', id } = req.body;

  const result = await cloudinaryService.uploadAdImage(req.file.buffer, type, id || Date.now());

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Delete file
 * DELETE /api/upload/:publicId
 */
const deleteFile = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const { resourceType = 'image' } = req.query;

  // Decode the publicId (it may be URL encoded)
  const decodedPublicId = decodeURIComponent(publicId);

  const result = await cloudinaryService.deleteFile(decodedPublicId, resourceType);

  res.json({
    success: true,
    data: result,
  });
});

/**
 * Delete file by URL
 * DELETE /api/upload/by-url
 */
const deleteByUrl = asyncHandler(async (req, res) => {
  const { url, resourceType = 'image' } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: 'URL is required',
    });
  }

  const publicId = cloudinaryService.extractPublicId(url);
  if (!publicId) {
    return res.status(400).json({
      success: false,
      error: 'Could not extract public ID from URL',
    });
  }

  const result = await cloudinaryService.deleteFile(publicId, resourceType);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  uploadImage,
  uploadImages,
  uploadAvatar,
  uploadListingImages,
  uploadIdentityDocument,
  uploadChatMedia,
  uploadBlogImage,
  uploadAdImage,
  deleteFile,
  deleteByUrl,
};
