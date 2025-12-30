const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Allow images and PDFs
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.'));
    }
  },
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
  next();
};

// All routes require authentication
router.use(authenticate);

// Single image upload
router.post('/image', upload.single('file'), handleMulterError, uploadController.uploadImage);

// Multiple images upload (max 10)
router.post('/images', upload.array('files', 10), handleMulterError, uploadController.uploadImages);

// Avatar upload
router.post('/avatar', upload.single('file'), handleMulterError, uploadController.uploadAvatar);

// Listing images upload
router.post(
  '/listing/:listingId',
  upload.array('files', 10),
  handleMulterError,
  uploadController.uploadListingImages
);

// Identity document upload
router.post(
  '/identity/:rentalRequestId',
  upload.single('file'),
  handleMulterError,
  uploadController.uploadIdentityDocument
);

// Chat media upload
router.post(
  '/chat/:conversationId',
  upload.single('file'),
  handleMulterError,
  uploadController.uploadChatMedia
);

// Blog image upload (admin only)
router.post(
  '/blog/:blogId',
  requireAdmin,
  upload.single('file'),
  handleMulterError,
  uploadController.uploadBlogImage
);

// Ad/banner image upload (admin only)
router.post(
  '/ad',
  requireAdmin,
  upload.single('file'),
  handleMulterError,
  uploadController.uploadAdImage
);

// Delete file by public ID
router.delete('/:publicId(*)', uploadController.deleteFile);

// Delete file by URL
router.delete('/', uploadController.deleteByUrl);

module.exports = router;
