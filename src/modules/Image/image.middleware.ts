import { Request, Response, NextFunction } from "express";
import { uploadSingle, uploadMultiple } from "../../config/multer.config";
import { HTTP_STATUS } from "./image.constant";

/**
 * Image Middleware
 * Layer: Request Processing
 * Responsibility: Handle file uploads with multer and error handling
 */

/**
 * Middleware for single file upload
 * Wraps multer.single() with custom error handling
 * Usage: router.post("/upload", handleSingleUpload, controller.uploadSingleImage)
 */
export const handleSingleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: `File upload error: ${err.message}`,
        data: null,
      });
    }
    next();
  });
};

/**
 * Middleware for multiple file uploads
 * Wraps multer.array() with custom error handling
 * Usage: router.post("/upload-multiple", handleMultipleUpload, controller.uploadMultipleImages)
 */
export const handleMultipleUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        success: false,
        message: `File upload error: ${err.message}`,
        data: null,
      });
    }
    next();
  });
};

/**
 * Middleware to validate folder parameter
 * Optional: Whitelist allowed folders
 */
export const validateImageFolder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const folder = req.body.folder;

  // Whitelist of allowed folders
  const ALLOWED_FOLDERS = [
    "homerent",
    "homerent/properties",
    "homerent/profiles",
    "homerent/blog",
  ];

  if (folder && !ALLOWED_FOLDERS.includes(folder)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      statusCode: HTTP_STATUS.BAD_REQUEST,
      success: false,
      message: "Invalid folder specified",
      data: null,
    });
  }

  next();
};
