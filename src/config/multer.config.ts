/**
 * Multer File Upload Configuration
 * Handles file upload validation and storage
 */
import multer from 'multer';
import type { Request } from 'express';

/**
 * Storage Configuration
 * Uses memory storage to upload directly to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File Filter Configuration
 * Validates MIME types and file naming
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed MIME types for images
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type. Allowed: JPEG, PNG, WebP, GIF. Received: ${file.mimetype}`
    );
    cb(error);
  }
};

/**
 * Multer configuration constants
 */
const MULTER_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  FIELD_NAME_SINGLE: 'image',
  FIELD_NAME_MULTIPLE: 'images',
} as const;

/**
 * Create multer instance with configured storage and filters
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MULTER_CONFIG.MAX_FILE_SIZE,
  },
});

/**
 * Middleware for single file upload
 * @example
 * router.post('/upload', uploadSingle, controller.handleUpload)
 */
export const uploadSingle = upload.single(MULTER_CONFIG.FIELD_NAME_SINGLE);

/**
 * Middleware for multiple file uploads
 * @example
 * router.post('/upload-multiple', uploadMultiple, controller.handleMultipleUploads)
 */
export const uploadMultiple = upload.array(
  MULTER_CONFIG.FIELD_NAME_MULTIPLE,
  MULTER_CONFIG.MAX_FILES
);

/**
 * Export configuration constants for use in validation
 */
export const multerConfig = MULTER_CONFIG;

export default upload;
