const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload folders mapping
 */
const UPLOAD_FOLDERS = {
  listings: 'rentpal/listings',
  avatars: 'rentpal/avatars',
  identity: 'rentpal/identity',
  ads: 'rentpal/ads',
  banners: 'rentpal/banners',
  blogs: 'rentpal/blogs',
  chat: 'rentpal/chat',
};

/**
 * Upload a file to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
const uploadFile = async (file, options = {}) => {
  const {
    folder = 'listings',
    resourceType = 'auto',
    publicId,
    transformation,
    tags = [],
  } = options;

  const uploadOptions = {
    folder: UPLOAD_FOLDERS[folder] || `rentpal/${folder}`,
    resource_type: resourceType,
    tags: ['rentpal', ...tags],
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  if (transformation) {
    uploadOptions.transformation = transformation;
  }

  // Handle different input types
  let uploadSource = file;
  if (Buffer.isBuffer(file)) {
    uploadSource = `data:image/png;base64,${file.toString('base64')}`;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(uploadSource, uploadOptions, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          resourceType: result.resource_type,
          bytes: result.bytes,
        });
      }
    });
  });
};

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects { buffer, originalname }
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadMultiple = async (files, options = {}) => {
  const uploads = files.map((file) => uploadFile(file.buffer || file, options));
  return Promise.all(uploads);
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} - Delete result
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Delete multiple files
 * @param {Array<string>} publicIds - Array of public IDs
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} - Delete result
 */
const deleteMultiple = async (publicIds, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(publicIds, { resource_type: resourceType }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
const getOptimizedUrl = (publicId, options = {}) => {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options;

  const transformation = {
    quality,
    fetch_format: format,
  };

  if (width) transformation.width = width;
  if (height) transformation.height = height;
  if (width || height) transformation.crop = crop;

  return cloudinary.url(publicId, {
    secure: true,
    transformation: [transformation],
  });
};

/**
 * Get thumbnail URL
 * @param {string} publicId - Public ID of the image
 * @param {number} size - Thumbnail size (default 200)
 * @returns {string} - Thumbnail URL
 */
const getThumbnailUrl = (publicId, size = 200) => {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto',
  });
};

/**
 * Upload avatar with automatic resizing
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {string} userId - User ID for organizing
 * @returns {Promise<Object>} - Upload result
 */
const uploadAvatar = async (file, userId) => {
  return uploadFile(file, {
    folder: 'avatars',
    publicId: `avatar_${userId}_${Date.now()}`,
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
    ],
  });
};

/**
 * Upload listing images
 * @param {Array} files - Array of files
 * @param {string} listingId - Listing ID
 * @returns {Promise<Array>} - Array of upload results
 */
const uploadListingImages = async (files, listingId) => {
  const uploads = files.map((file, index) =>
    uploadFile(file.buffer || file, {
      folder: 'listings',
      publicId: `listing_${listingId}_${index}_${Date.now()}`,
      transformation: [{ width: 1200, height: 800, crop: 'limit' }, { quality: 'auto' }],
    })
  );
  return Promise.all(uploads);
};

/**
 * Upload identity document (restricted access)
 * @param {Buffer|string} file - File buffer
 * @param {string} userId - User ID
 * @param {string} rentalRequestId - Rental request ID
 * @returns {Promise<Object>} - Upload result
 */
const uploadIdentityDocument = async (file, userId, rentalRequestId) => {
  return uploadFile(file, {
    folder: 'identity',
    publicId: `id_${userId}_${rentalRequestId}_${Date.now()}`,
    resourceType: 'auto', // Support PDFs
    tags: ['identity', 'private'],
  });
};

/**
 * Upload chat media
 * @param {Buffer|string} file - File buffer
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} - Upload result
 */
const uploadChatMedia = async (file, conversationId) => {
  return uploadFile(file, {
    folder: 'chat',
    publicId: `chat_${conversationId}_${Date.now()}`,
    resourceType: 'auto',
  });
};

/**
 * Upload blog image
 * @param {Buffer|string} file - File buffer
 * @param {string} blogId - Blog ID or slug
 * @returns {Promise<Object>} - Upload result
 */
const uploadBlogImage = async (file, blogId) => {
  return uploadFile(file, {
    folder: 'blogs',
    publicId: `blog_${blogId}_${Date.now()}`,
    transformation: [{ width: 1200, height: 630, crop: 'fill' }, { quality: 'auto' }],
  });
};

/**
 * Upload ad/banner image
 * @param {Buffer|string} file - File buffer
 * @param {string} type - 'ad' or 'banner'
 * @param {string} id - Ad or banner ID
 * @returns {Promise<Object>} - Upload result
 */
const uploadAdImage = async (file, type, id) => {
  return uploadFile(file, {
    folder: type === 'banner' ? 'banners' : 'ads',
    publicId: `${type}_${id}_${Date.now()}`,
    transformation: [{ quality: 'auto' }],
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
  if (!url) return null;

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v{version}/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension
    return pathAfterUpload.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  uploadMultiple,
  deleteFile,
  deleteMultiple,
  getOptimizedUrl,
  getThumbnailUrl,
  uploadAvatar,
  uploadListingImages,
  uploadIdentityDocument,
  uploadChatMedia,
  uploadBlogImage,
  uploadAdImage,
  extractPublicId,
  UPLOAD_FOLDERS,
};
