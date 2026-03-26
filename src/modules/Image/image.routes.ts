import express, { Router } from "express";
import { ImageController } from "./image.controller";
import {
  handleSingleUpload,
  handleMultipleUpload,
  validateImageFolder,
} from "./image.middleware";

/**
 * Image Routes
 * Layer: HTTP Routing
 * Responsibility: Define API endpoints and connect to controller methods
 */

const router: Router = express.Router();

/**
 * POST /api/images/upload
 * Upload a single image to Cloudinary
 *
 * Request:
 * - Form-data with "image" field (required)
 * - Optional "folder" field for custom Cloudinary folder
 *
 * Response:
 * {
 *   "statusCode": 200,
 *   "success": true,
 *   "message": "Image uploaded successfully",
 *   "data": {
 *     "url": "https://res.cloudinary.com/...",
 *     "filename": "image.jpg",
 *     "size": 245789
 *   }
 * }
 */
router.post(
  "/upload",
  handleSingleUpload,
  validateImageFolder,
  ImageController.uploadSingleImage
);

/**
 * POST /api/images/upload-multiple
 * Upload multiple images to Cloudinary (max 10 images)
 *
 * Request:
 * - Form-data with "images" field (required, multiple files)
 * - Optional "folder" field for custom Cloudinary folder
 *
 * Response:
 * {
 *   "statusCode": 200,
 *   "success": true,
 *   "message": "3 image(s) uploaded successfully",
 *   "data": {
 *     "urls": ["https://res.cloudinary.com/...", ...],
 *     "count": 3,
 *     "filenames": ["img1.jpg", "img2.jpg", "img3.jpg"]
 *   }
 * }
 */
router.post(
  "/upload-multiple",
  handleMultipleUpload,
  validateImageFolder,
  ImageController.uploadMultipleImages
);

/**
 * DELETE /api/images/:imageUrl
 * Delete a single image from Cloudinary
 *
 * Params:
 * - imageUrl: URL-encoded Cloudinary image URL
 *
 * Response:
 * {
 *   "statusCode": 200,
 *   "success": true,
 *   "message": "Image deleted successfully",
 *   "data": null
 * }
 */
router.delete("/:imageUrl", ImageController.deleteSingleImage);

/**
 * POST /api/images/delete-multiple
 * Delete multiple images from Cloudinary
 *
 * Request Body:
 * {
 *   "imageUrls": [
 *     "https://res.cloudinary.com/...",
 *     "https://res.cloudinary.com/..."
 *   ]
 * }
 *
 * Response:
 * {
 *   "statusCode": 200,
 *   "success": true,
 *   "message": "2 image(s) deleted successfully",
 *   "data": null
 * }
 */
router.post("/delete-multiple", ImageController.deleteMultipleImages);

export { router as ImageRoutes };
