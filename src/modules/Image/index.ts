/**
 * Image Module Exports
 * Central export point for all image-related modules
 */

// Routes
export { ImageRoutes } from "./image.routes";

// Controller
export { ImageController } from "./image.controller";

// Service
export { ImageService } from "./image.service";

// Middleware
export { handleSingleUpload, handleMultipleUpload, validateImageFolder } from "./image.middleware";

// Utils
export {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
} from "./image.utils";

// Constants
export { IMAGE_CONSTANTS, HTTP_STATUS } from "./image.constant";

// Interfaces
export type {
  IUploadResponse,
  IUploadMultipleResponse,
  IDeleteRequest,
  IDeleteMultipleRequest,
  ICloudinaryUploadResult,
  IImageServiceResponse,
} from "./image.interface";

// Validation
export { ImageValidation } from "./image.validation";
