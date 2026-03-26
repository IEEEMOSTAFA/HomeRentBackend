/**
 * HTTP Status Constants
 * Standardized status codes used across the application
 */

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Standard Error Messages
 * Consistent error messages across the application
 */
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "You are not authorized to access this resource",
  FORBIDDEN: "Access forbidden",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",

  // Validation
  VALIDATION_FAILED: "Validation failed",
  INVALID_INPUT: "Invalid input provided",
  REQUIRED_FIELD: "This field is required",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters",

  // Resource
  NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",
  CANNOT_DELETE: "Cannot delete this resource",
  CANNOT_UPDATE: "Cannot update this resource",

  // Business Logic
  INVALID_STATUS: "Invalid status transition",
  EXPIRED_REQUEST: "Request has expired",
  PAYMENT_FAILED: "Payment processing failed",
  BOOKING_CONFLICT: "Booking conflict detected",

  // Server
  INTERNAL_ERROR: "Internal server error",
  DATABASE_ERROR: "Database operation failed",
  EXTERNAL_SERVICE_ERROR: "External service error",
} as const;

/**
 * Success Messages
 * Consistent success messages across the application
 */
export const SUCCESS_MESSAGES = {
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  RETRIEVED: "Resource retrieved successfully",
  FETCHED: "Data fetched successfully",
  PROCESSED: "Request processed successfully",
} as const;

/**
 * User Role Constants
 * Matches Prisma UserRole enum
 */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  USER: "USER",
} as const;

/**
 * Property Status Constants
 * Matches Prisma PropertyStatus enum
 */
export const PROPERTY_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

/**
 * Booking Status Constants
 * Matches Prisma BookingStatus enum
 */
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  CONFIRMED: "CONFIRMED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
} as const;

/**
 * Payment Status Constants
 * Matches Prisma PaymentStatus enum
 */
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

/**
 * Property Type Constants
 * Matches Prisma PropertyType enum
 */
export const PROPERTY_TYPES = {
  FAMILY_FLAT: "FAMILY_FLAT",
  BACHELOR_ROOM: "BACHELOR_ROOM",
  SUBLET: "SUBLET",
  HOSTEL: "HOSTEL",
  OFFICE_SPACE: "OFFICE_SPACE",
  COMMERCIAL: "COMMERCIAL",
} as const;

/**
 * Available For Constants
 * Matches Prisma AvailableFor enum
 */
export const AVAILABLE_FOR = {
  FAMILY: "FAMILY",
  BACHELOR: "BACHELOR",
  CORPORATE: "CORPORATE",
  ANY: "ANY",
} as const;

/**
 * Notification Type Constants
 * Matches Prisma Notification type field
 */
export const NOTIFICATION_TYPES = {
  BOOKING_UPDATE: "booking_update",
  PAYMENT: "payment",
  REVIEW: "review",
  SYSTEM: "system",
} as const;
