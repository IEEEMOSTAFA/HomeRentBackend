import httpStatus from "http-status";
import { Request, Response } from "express";
import { ImageService } from "./image.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IMAGE_CONSTANTS, HTTP_STATUS } from "./image.constant";
import { IUploadResponse, IUploadMultipleResponse } from "./image.interface";

// ================= IMAGE UPLOAD HANDLERS =================

/**
 * Upload a single image
 * POST /api/images/upload
 * @param req.file - Single image file from multer
 * @param req.body.folder - Optional Cloudinary folder
 */
const uploadSingleImageHandler = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILE_PROVIDED,
        data: null,
      });
    }

    const folder = req.body.folder || IMAGE_CONSTANTS.DEFAULT_FOLDER;

    // Call service to handle upload logic
    const imageUrl = await ImageService.uploadSingleImage(req.file, folder);

    const responseData: IUploadResponse = {
      url: imageUrl,
      filename: req.file.originalname,
      size: req.file.size,
    };

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: IMAGE_CONSTANTS.SUCCESS_MESSAGES.UPLOADED_SINGLE,
      data: responseData,
    });
  }
);

/**
 * Upload multiple images
 * POST /api/images/upload-multiple
 * @param req.files - Multiple image files from multer (max 10)
 * @param req.body.folder - Optional Cloudinary folder
 */
const uploadMultipleImagesHandler = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_FILES_PROVIDED,
        data: null,
      });
    }

    const folder = req.body.folder || IMAGE_CONSTANTS.DEFAULT_FOLDER;

    // Call service to handle batch upload logic
    const imageUrls = await ImageService.uploadMultipleImages(
      req.files as Express.Multer.File[],
      folder
    );

    const responseData: IUploadMultipleResponse = {
      urls: imageUrls,
      count: imageUrls.length,
      filenames: (req.files as Express.Multer.File[]).map((f) => f.originalname),
    };

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${imageUrls.length} ${IMAGE_CONSTANTS.SUCCESS_MESSAGES.UPLOADED_MULTIPLE}`,
      data: responseData,
    });
  }
);

// ================= IMAGE DELETION HANDLERS =================

/**
 * Delete a single image
 * DELETE /api/images/:imageUrl
 * @param req.params.imageUrl - URL-encoded Cloudinary image URL
 */
const deleteSingleImageHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { imageUrl } = req.params;

    if (!imageUrl) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URL,
        data: null,
      });
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl as string);

    // Call service to handle deletion logic
    await ImageService.deleteSingleImage(decodedUrl);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: IMAGE_CONSTANTS.SUCCESS_MESSAGES.DELETED_SINGLE,
      data: null,
    });
  }
);

/**
 * Delete multiple images
 * POST /api/images/delete-multiple
 * @param req.body.imageUrls - Array of Cloudinary image URLs
 */
const deleteMultipleImagesHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URLS,
        data: null,
      });
    }

    // Call service to handle batch deletion logic
    await ImageService.deleteMultipleImages(imageUrls);

    return sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${imageUrls.length} ${IMAGE_CONSTANTS.SUCCESS_MESSAGES.DELETED_MULTIPLE}`,
      data: null,
    });
  }
);

// ================= IMAGE CONTROLLER =================
export const ImageController = {
  uploadSingleImage: uploadSingleImageHandler,
  uploadMultipleImages: uploadMultipleImagesHandler,
  deleteSingleImage: deleteSingleImageHandler,
  deleteMultipleImages: deleteMultipleImagesHandler,
};
