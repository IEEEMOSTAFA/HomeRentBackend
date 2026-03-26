import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "./image.utils";
import { IMAGE_CONSTANTS } from "./image.constant";

/**
 * Image Service
 * Layer: Business Logic
 * Responsibility: Handle all image upload/deletion operations and validation
 */

export const ImageService = {
  /**
   * Upload a single image to Cloudinary
   * @param file - Express multer file object
   * @param folder - Cloudinary folder path (default: "homerent")
   * @returns URL of uploaded image
   * @throws Error if upload fails or validation fails
   */
  async uploadSingleImage(
    file: Express.Multer.File,
    folder: string = IMAGE_CONSTANTS.DEFAULT_FOLDER
  ): Promise<string> {
    // Validate file exists
    if (!file) {
      throw new Error(IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILE_PROVIDED);
    }

    // Validate file type
    if (!IMAGE_CONSTANTS.SUPPORTED_FORMATS.includes(file.mimetype)) {
      throw new Error(
        `${IMAGE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE}. Received: ${file.mimetype}`
      );
    }

    // Validate file size
    if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
      throw new Error(IMAGE_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    try {
      const imageUrl = await uploadToCloudinary(file.buffer, folder);
      return imageUrl;
    } catch (error) {
      throw new Error(
        `${IMAGE_CONSTANTS.ERROR_MESSAGES.UPLOAD_FAILED}: ${
          (error as Error).message
        }`
      );
    }
  },

  /**
   * Upload multiple images to Cloudinary
   * @param files - Array of Express multer file objects
   * @param folder - Cloudinary folder path (default: "homerent")
   * @returns Array of uploaded image URLs
   * @throws Error if validation fails or batch upload fails
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder: string = IMAGE_CONSTANTS.DEFAULT_FOLDER
  ): Promise<string[]> {
    // Validate files array exists and has content
    if (!files || files.length === 0) {
      throw new Error(IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILES_PROVIDED);
    }

    // Validate not exceeding max files per request
    if (files.length > IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST) {
      throw new Error(
        `Maximum ${IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST} images per request allowed`
      );
    }

    // Validate each file
    for (const file of files) {
      if (!IMAGE_CONSTANTS.SUPPORTED_FORMATS.includes(file.mimetype)) {
        throw new Error(
          `${file.originalname}: ${IMAGE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE}`
        );
      }

      if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
        throw new Error(
          `${file.originalname}: ${IMAGE_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE}`
        );
      }
    }

    try {
      const buffers = files.map((f) => f.buffer);
      const imageUrls = await uploadMultipleToCloudinary(buffers, folder);
      return imageUrls;
    } catch (error) {
      throw new Error(
        `${IMAGE_CONSTANTS.ERROR_MESSAGES.BATCH_UPLOAD_FAILED}: ${
          (error as Error).message
        }`
      );
    }
  },

  /**
   * Delete a single image from Cloudinary
   * @param imageUrl - Cloudinary image URL
   * @throws Error if URL is invalid or deletion fails
   */
  async deleteSingleImage(imageUrl: string): Promise<void> {
    // Validate URL
    if (!imageUrl) {
      throw new Error(IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URL);
    }

    // Basic URL validation
    if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
      throw new Error("Invalid Cloudinary URL format");
    }

    try {
      await deleteFromCloudinary(imageUrl);
    } catch (error) {
      throw new Error(
        `${IMAGE_CONSTANTS.ERROR_MESSAGES.DELETE_FAILED}: ${
          (error as Error).message
        }`
      );
    }
  },

  /**
   * Delete multiple images from Cloudinary
   * @param imageUrls - Array of Cloudinary image URLs
   * @throws Error if validation fails or batch deletion fails
   */
  async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    // Validate array exists and has content
    if (!imageUrls || imageUrls.length === 0) {
      throw new Error(IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URLS);
    }

    // Validate each URL
    for (const url of imageUrls) {
      if (!url.startsWith("https://res.cloudinary.com/")) {
        throw new Error(`Invalid Cloudinary URL format: ${url}`);
      }
    }

    try {
      await deleteMultipleFromCloudinary(imageUrls);
    } catch (error) {
      throw new Error(
        `${IMAGE_CONSTANTS.ERROR_MESSAGES.BATCH_DELETE_FAILED}: ${
          (error as Error).message
        }`
      );
    }
  },
};
