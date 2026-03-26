import { z } from "zod";

/**
 * Image Module Validation Schemas
 */

export const ImageValidation = {
  /**
   * Validate single file upload request
   */
  uploadSingleSchema: z.object({
    body: z.object({
      folder: z.string().default("homerent"),
    }),
    file: z.object({
      buffer: z.instanceof(Buffer),
      originalname: z.string(),
      size: z.number(),
      mimetype: z.string(),
    }).refine((file) => {
      const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      return ALLOWED_MIMES.includes(file.mimetype);
    }, {
      message: "Only JPEG, PNG, WebP, and GIF images are allowed",
    }).refine((file) => {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      return file.size <= MAX_SIZE;
    }, {
      message: "File size exceeds maximum limit of 5MB",
    }),
  }),

  /**
   * Validate multiple files upload request
   */
  uploadMultipleSchema: z.object({
    body: z.object({
      folder: z.string().default("homerent"),
    }),
    files: z.array(
      z.object({
        buffer: z.instanceof(Buffer),
        originalname: z.string(),
        size: z.number(),
        mimetype: z.string(),
      }).refine((file) => {
        const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        return ALLOWED_MIMES.includes(file.mimetype);
      }, {
        message: "Only JPEG, PNG, WebP, and GIF images are allowed",
      }).refine((file) => {
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        return file.size <= MAX_SIZE;
      }, {
        message: "File size exceeds maximum limit of 5MB",
      })
    ).refine((files) => files.length <= 10, {
      message: "Maximum 10 images per request",
    }),
  }),

  /**
   * Validate delete single image request
   */
  deleteSingleSchema: z.object({
    params: z.object({
      imageUrl: z.string().url("Invalid image URL format"),
    }),
  }),

  /**
   * Validate delete multiple images request
   */
  deleteMultipleSchema: z.object({
    body: z.object({
      imageUrls: z.array(
        z.string().url("Invalid image URL format")
      ).min(1, "At least one image URL is required"),
    }),
  }),
};
