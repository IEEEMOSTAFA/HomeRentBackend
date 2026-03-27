import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "./image.utils";
import { IMAGE_CONSTANTS } from "./image.constant";

// ================= IMAGE UPLOAD SERVICES =================

/**
 * Upload a single image to Cloudinary
 * @param file - Express multer file object
 * @param folder - Cloudinary folder path (default: "homerent")
 * @returns URL of uploaded image
 * @throws AppError if upload fails or validation fails
 */
const uploadSingleImageToCloudinary = async (
  file: Express.Multer.File,
  folder: string = IMAGE_CONSTANTS.DEFAULT_FOLDER
): Promise<string> => {
  // Validate file exists
  if (!file) {
    throw new AppError(
      IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILE_PROVIDED,
      httpStatus.BAD_REQUEST
    );
  }

  // Validate file type
  if (!IMAGE_CONSTANTS.SUPPORTED_FORMATS.includes(file.mimetype)) {
    throw new AppError(
      `${IMAGE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE}. Received: ${file.mimetype}`,
      httpStatus.BAD_REQUEST
    );
  }

  // Validate file size
  if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
    throw new AppError(
      IMAGE_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE,
      httpStatus.BAD_REQUEST
    );
  }

  try {
    const imageUrl = await uploadToCloudinary(file.buffer, folder);
    return imageUrl;
  } catch (error) {
    throw new AppError(
      `${IMAGE_CONSTANTS.ERROR_MESSAGES.UPLOAD_FAILED}: ${
        (error as Error).message
      }`,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of Express multer file objects
 * @param folder - Cloudinary folder path (default: "homerent")
 * @returns Array of uploaded image URLs
 * @throws AppError if validation fails or batch upload fails
 */
const uploadMultipleImagesToCloudinary = async (
  files: Express.Multer.File[],
  folder: string = IMAGE_CONSTANTS.DEFAULT_FOLDER
): Promise<string[]> => {
  // Validate files array exists and has content
  if (!files || files.length === 0) {
    throw new AppError(
      IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILES_PROVIDED,
      httpStatus.BAD_REQUEST
    );
  }

  // Validate not exceeding max files per request
  if (files.length > IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST) {
    throw new AppError(
      `Maximum ${IMAGE_CONSTANTS.MAX_IMAGES_PER_REQUEST} images per request allowed`,
      httpStatus.BAD_REQUEST
    );
  }

  // Validate each file
  for (const file of files) {
    if (!IMAGE_CONSTANTS.SUPPORTED_FORMATS.includes(file.mimetype)) {
      throw new AppError(
        `${file.originalname}: ${IMAGE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE}`,
        httpStatus.BAD_REQUEST
      );
    }

    if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
      throw new AppError(
        `${file.originalname}: ${IMAGE_CONSTANTS.ERROR_MESSAGES.FILE_TOO_LARGE}`,
        httpStatus.BAD_REQUEST
      );
    }
  }

  try {
    const buffers = files.map((f) => f.buffer);
    const imageUrls = await uploadMultipleToCloudinary(buffers, folder);
    return imageUrls;
  } catch (error) {
    throw new AppError(
      `${IMAGE_CONSTANTS.ERROR_MESSAGES.BATCH_UPLOAD_FAILED}: ${
        (error as Error).message
      }`,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

// ================= IMAGE DELETION SERVICES =================

/**
 * Delete a single image from Cloudinary
 * @param imageUrl - Cloudinary image URL
 * @throws AppError if URL is invalid or deletion fails
 */
const deleteSingleImageFromCloudinary = async (
  imageUrl: string
): Promise<void> => {
  // Validate URL
  if (!imageUrl) {
    throw new AppError(
      IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URL,
      httpStatus.BAD_REQUEST
    );
  }

  // Basic URL validation
  if (!imageUrl.startsWith("https://res.cloudinary.com/")) {
    throw new AppError(
      "Invalid Cloudinary URL format",
      httpStatus.BAD_REQUEST
    );
  }

  try {
    await deleteFromCloudinary(imageUrl);
  } catch (error) {
    throw new AppError(
      `${IMAGE_CONSTANTS.ERROR_MESSAGES.DELETE_FAILED}: ${
        (error as Error).message
      }`,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param imageUrls - Array of Cloudinary image URLs
 * @throws AppError if validation fails or batch deletion fails
 */
const deleteMultipleImagesFromCloudinary = async (
  imageUrls: string[]
): Promise<void> => {
  // Validate array exists and has content
  if (!imageUrls || imageUrls.length === 0) {
    throw new AppError(
      IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URLS,
      httpStatus.BAD_REQUEST
    );
  }

  // Validate each URL
  for (const url of imageUrls) {
    if (!url.startsWith("https://res.cloudinary.com/")) {
      throw new AppError(
        `Invalid Cloudinary URL format: ${url}`,
        httpStatus.BAD_REQUEST
      );
    }
  }

  try {
    await deleteMultipleFromCloudinary(imageUrls);
  } catch (error) {
    throw new AppError(
      `${IMAGE_CONSTANTS.ERROR_MESSAGES.BATCH_DELETE_FAILED}: ${
        (error as Error).message
      }`,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

// ================= IMAGE SERVICE =================
export const ImageService = {
  uploadSingleImage: uploadSingleImageToCloudinary,
  uploadMultipleImages: uploadMultipleImagesToCloudinary,
  deleteSingleImage: deleteSingleImageFromCloudinary,
  deleteMultipleImages: deleteMultipleImagesFromCloudinary,
};
