/**
 * Image Module Constants
 */

export const IMAGE_CONSTANTS = {
  // Supported formats
  SUPPORTED_FORMATS: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  SUPPORTED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp", ".gif"],

  // File size limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE_DISPLAY: "5MB",

  // Upload limits
  MAX_IMAGES_PER_REQUEST: 10,

  // Cloudinary configuration
  DEFAULT_FOLDER: "homerent",
  PROPERTY_FOLDER: "homerent/properties",
  PROFILE_FOLDER: "homerent/profiles",
  BLOG_FOLDER: "homerent/blog",

  // Error messages
  ERROR_MESSAGES: {
    NO_FILE_PROVIDED: "No file uploaded",
    NO_FILES_PROVIDED: "No files uploaded",
    INVALID_FILE_TYPE: "Only JPEG, PNG, WebP, and GIF images are allowed",
    FILE_TOO_LARGE: "File size exceeds maximum limit of 5MB",
    NO_IMAGE_URL: "Image URL is required",
    NO_IMAGE_URLS: "Image URLs array is required",
    UPLOAD_FAILED: "Failed to upload image to Cloudinary",
    DELETE_FAILED: "Failed to delete image from Cloudinary",
    BATCH_UPLOAD_FAILED: "Batch upload failed",
    BATCH_DELETE_FAILED: "Batch deletion failed",
  },

  // Success messages
  SUCCESS_MESSAGES: {
    UPLOADED_SINGLE: "Image uploaded successfully",
    UPLOADED_MULTIPLE: "image(s) uploaded successfully",
    DELETED_SINGLE: "Image deleted successfully",
    DELETED_MULTIPLE: "image(s) deleted successfully",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
