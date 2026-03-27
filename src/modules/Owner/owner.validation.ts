import { z } from "zod";
import { OWNER_DEFAULTS } from "./owner.constant";

// ================= CREATE PROPERTY VALIDATION =================
export const createPropertyValidationSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be less than 5000 characters"),
  type: z.enum([
    "FAMILY_FLAT",
    "BACHELOR_ROOM",
    "SUBLET",
    "HOSTEL",
    "OFFICE_SPACE",
    "COMMERCIAL",
  ]),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  area: z
    .string()
    .min(2, "Area must be at least 2 characters")
    .max(50, "Area must be less than 50 characters"),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(500, "Address must be less than 500 characters"),
  bedrooms: z
    .number()
    .int()
    .min(0, "Bedrooms cannot be negative")
    .max(50, "Bedrooms cannot exceed 50"),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms cannot be negative")
    .max(50, "Bathrooms cannot exceed 50"),
  size: z
    .number()
    .positive("Size must be positive")
    .optional()
    .nullable(),
  rentAmount: z
    .number()
    .positive("Rent amount must be positive"),
  advanceDeposit: z
    .number()
    .min(0, "Advance deposit cannot be negative")
    .optional()
    .default(0),
  bookingFee: z
    .number()
    .min(0, "Booking fee cannot be negative")
    .optional()
    .default(0),
  isNegotiable: z
    .boolean()
    .optional()
    .default(false),
  availableFrom: z
    .string()
    .datetime("Must be a valid ISO datetime"),
  availableFor: z
    .enum(["FAMILY", "BACHELOR", "CORPORATE", "ANY"])
    .optional()
    .default("ANY"),
  images: z
    .array(z.string().url("Each image must be a valid URL"))
    .max(
      OWNER_DEFAULTS.MAX_IMAGES_PER_PROPERTY,
      `Maximum ${OWNER_DEFAULTS.MAX_IMAGES_PER_PROPERTY} images allowed`
    )
    .optional()
    .default([]),
});

// ================= UPDATE PROPERTY VALIDATION =================
export const updatePropertyValidationSchema = createPropertyValidationSchema.partial();

// ================= UPDATE OWNER PROFILE VALIDATION =================
export const updateOwnerProfileValidationSchema = z.object({
  phone: z
    .string()
    .regex(/^[0-9+\-\s\(\)]{10,}$/, "Invalid phone number format")
    .optional()
    .nullable(),
  nidNumber: z
    .string()
    .min(OWNER_DEFAULTS.MIN_NID_LENGTH, `NID must be at least ${OWNER_DEFAULTS.MIN_NID_LENGTH} characters`)
    .max(OWNER_DEFAULTS.MAX_NID_LENGTH, `NID must be less than ${OWNER_DEFAULTS.MAX_NID_LENGTH} characters`)
    .optional()
    .nullable(),
});

// ================= RESPOND TO BOOKING VALIDATION =================
export const respondToBookingValidationSchema = z.object({
  status: z
    .enum(["ACCEPTED", "DECLINED"])
    .describe("Status must be ACCEPTED or DECLINED"),
  declineReason: z
    .string()
    .max(500, "Decline reason must be less than 500 characters")
    .optional(),
});

// ================= FLAG REVIEW VALIDATION =================
export const flagReviewValidationSchema = z.object({
  isFlagged: z.boolean(),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be less than 500 characters")
    .optional(),
});

// ================= INFER TYPES =================
export type CreatePropertyInput = z.infer<typeof createPropertyValidationSchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertyValidationSchema>;
export type UpdateOwnerProfileInput = z.infer<typeof updateOwnerProfileValidationSchema>;
export type RespondToBookingInput = z.infer<typeof respondToBookingValidationSchema>;
export type FlagReviewInput = z.infer<typeof flagReviewValidationSchema>;