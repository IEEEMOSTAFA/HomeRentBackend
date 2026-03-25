import { z } from "zod";

// ================= PROPERTY APPROVAL VALIDATION =================
export const approvePropertyValidationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters")
    .max(500, "Rejection reason must not exceed 500 characters")
    .optional(),
});

// ================= OWNER VERIFICATION VALIDATION =================
export const verifyOwnerValidationSchema = z.object({
  verified: z.boolean(),
});

// ================= REVIEW VISIBILITY VALIDATION =================
export const hideReviewValidationSchema = z.object({
  isVisible: z.boolean(),
});

// ================= PAYMENT REFUND VALIDATION =================
export const refundPaymentValidationSchema = z.object({
  refundAmount: z
    .number()
    .positive("Refund amount must be positive")
    .optional(),
  reason: z
    .string()
    .min(5, "Reason must be at least 5 characters")
    .optional(),
});

// ================= BLOG POST VALIDATION =================
export const createBlogValidationSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must not exceed 200 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  excerpt: z
    .string()
    .min(20, "Excerpt must be at least 20 characters")
    .max(500, "Excerpt must not exceed 500 characters"),
  content: z
    .string()
    .min(100, "Content must be at least 100 characters")
    .max(5000, "Content must not exceed 5000 characters"),
  featuredImage: z
    .string()
    .url("Featured image must be a valid URL")
    .optional()
    .nullable(),
  tags: z
    .array(z.string())
    .default([]),
});

export const updateBlogValidationSchema = createBlogValidationSchema.partial();

export const publishBlogValidationSchema = z.object({
  isPublished: z.boolean(),
});

// ================= INFER TYPES =================
export type ApprovePropertyInput = z.infer<typeof approvePropertyValidationSchema>;
export type VerifyOwnerInput = z.infer<typeof verifyOwnerValidationSchema>;
export type HideReviewInput = z.infer<typeof hideReviewValidationSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentValidationSchema>;
export type CreateBlogInput = z.infer<typeof createBlogValidationSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogValidationSchema>;
export type PublishBlogInput = z.infer<typeof publishBlogValidationSchema>;