/**
 * Shared Module Exports
 * Central export point for all shared utilities
 */

// Response & Error Handling
export { default as sendResponse } from "./sendResponse";
export { default as catchAsync } from "./catchAsync";
export type { IApiResponse } from "./sendResponse";

// Interfaces
export type {
  IUser,
  IProperty,
  IBooking,
  IPayment,
  IReview,
  INotification,
  ICreatePropertyDTO,
  ICreateBookingDTO,
  ICreateReviewDTO,
  IPropertyFilters,
  IBookingFilters,
  IPaginationMeta,
  IPaginatedResponse,
  IErrorResponse,
  IAppError,
  IPaginationQuery,
  IPaginationResult,
} from "./interface";

// Constants
export {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  USER_ROLES,
  PROPERTY_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PROPERTY_TYPES,
  AVAILABLE_FOR,
  NOTIFICATION_TYPES,
} from "./constants";

// Pagination
export {
  parsePagination,
  calculatePaginationMeta,
  formatPaginatedResult,
} from "./pagination";

// Validators
export {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidObjectId,
  isValidEnum,
  isInRange,
  isValidLength,
  isValidUrl,
  isCloudinaryUrl,
  isValidDate,
  isFutureDate,
  isEmpty,
} from "./validators";

// Utils
export {
  formatDate,
  daysBetween,
  formatCurrency,
  generateSlug,
  truncate,
  cleanString,
  capitalize,
  toCommaSeparated,
  hasRequiredFields,
  pickFields,
  omitFields,
  mergeObjects,
  generateRandomString,
  sleep,
  retryAsync,
} from "./utils";
