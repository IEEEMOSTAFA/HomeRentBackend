import { Request, Response } from "express";
import { ImageService } from "./image.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IMAGE_CONSTANTS, HTTP_STATUS } from "./image.constant";
import { IUploadResponse, IUploadMultipleResponse } from "./image.interface";

/**
 * Image Controller
 * Handles HTTP requests for image upload and deletion
 * Layer: HTTP Request Handler
 * Responsibility: Parse requests, call service, format responses
 */

export const ImageController = {
  /**
   * Upload a single image
   * POST /api/images/upload
   * @param req.file - Single image file from multer
   * @param req.body.folder - Optional Cloudinary folder
   */
  uploadSingleImage: catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
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
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: IMAGE_CONSTANTS.SUCCESS_MESSAGES.UPLOADED_SINGLE,
      data: responseData,
    });
  }),

  /**
   * Upload multiple images
   * POST /api/images/upload-multiple
   * @param req.files - Multiple image files from multer (max 10)
   * @param req.body.folder - Optional Cloudinary folder
   */
  uploadMultipleImages: catchAsync(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
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
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: `${imageUrls.length} ${IMAGE_CONSTANTS.SUCCESS_MESSAGES.UPLOADED_MULTIPLE}`,
      data: responseData,
    });
  }),

  /**
   * Delete a single image
   * DELETE /api/images/:imageUrl
   * @param req.params.imageUrl - URL-encoded Cloudinary image URL
   */
  deleteSingleImage: catchAsync(async (req: Request, res: Response) => {
    const { imageUrl } = req.params;

    if (!imageUrl) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URL,
        data: null,
      });
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(imageUrl);
    
    // Call service to handle deletion logic
    await ImageService.deleteSingleImage(decodedUrl);

    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: IMAGE_CONSTANTS.SUCCESS_MESSAGES.DELETED_SINGLE,
      data: null,
    });
  }),

  /**
   * Delete multiple images
   * POST /api/images/delete-multiple
   * @param req.body.imageUrls - Array of Cloudinary image URLs
   */
  deleteMultipleImages: catchAsync(async (req: Request, res: Response) => {
    const { imageUrls } = req.body;

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return sendResponse(res, {
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: IMAGE_CONSTANTS.ERROR_MESSAGES.NO_IMAGE_URLS,
        data: null,
      });
    }

    // Call service to handle batch deletion logic
    await ImageService.deleteMultipleImages(imageUrls);

    return sendResponse(res, {
      statusCode: HTTP_STATUS.OK,
      success: true,
      message: `${imageUrls.length} ${IMAGE_CONSTANTS.SUCCESS_MESSAGES.DELETED_MULTIPLE}`,
      data: null,
    });
  }),
};
