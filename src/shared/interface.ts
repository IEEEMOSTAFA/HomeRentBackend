/**
 * Shared Interfaces
 * Common type definitions across the application
 * Aligns with Prisma schema
 */

// ─────────────────────────────────────────────────────────────────────
// Response Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  meta?: IPaginationMeta;
}

// ─────────────────────────────────────────────────────────────────────
// Error Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IErrorResponse {
  statusCode: number;
  success: false;
  message: string;
  data: null;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface IAppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ─────────────────────────────────────────────────────────────────────
// User-Related Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "ADMIN" | "OWNER" | "USER";
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserPayload extends Partial<IUser> {
  id: string;
}

// ─────────────────────────────────────────────────────────────────────
// Property-Related Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IProperty {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  type: "FAMILY_FLAT" | "BACHELOR_ROOM" | "SUBLET" | "HOSTEL" | "OFFICE_SPACE" | "COMMERCIAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  rentAmount: number;
  advanceDeposit: number;
  bookingFee: number;
  isNegotiable: boolean;
  availableFrom: Date;
  availableFor: "FAMILY" | "BACHELOR" | "CORPORATE" | "ANY";
  images: string[];
  rating: number;
  totalReviews: number;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePropertyDTO {
  title: string;
  description: string;
  type: string;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size?: number;
  rentAmount: number;
  advanceDeposit?: number;
  bookingFee?: number;
  isNegotiable?: boolean;
  availableFrom: string | Date;
  availableFor?: string;
  images?: string[];
}

// ─────────────────────────────────────────────────────────────────────
// Booking-Related Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IBooking {
  id: string;
  propertyId: string;
  userId: string;
  moveInDate: Date;
  moveOutDate?: Date;
  message?: string;
  numberOfTenants: number;
  rentAmount: number;
  bookingFee: number;
  totalAmount: number;
  status: "PENDING" | "ACCEPTED" | "PAYMENT_PENDING" | "CONFIRMED" | "DECLINED" | "CANCELLED";
  cancellationNote?: string;
  expiresAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBookingDTO {
  propertyId: string;
  moveInDate: string | Date;
  moveOutDate?: string | Date;
  message?: string;
  numberOfTenants?: number;
}

// ─────────────────────────────────────────────────────────────────────
// Payment-Related Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IPayment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  receiptUrl?: string;
  refundAmount?: number;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────
// Review-Related Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IReview {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment?: string;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReviewDTO {
  bookingId: string;
  rating: number;
  comment?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Query Filter Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IPropertyFilters {
  type?: string;
  city?: string;
  area?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  availableFor?: string;
  search?: string;
  sortBy?: "rating" | "newest" | "price";
  page?: number;
  limit?: number;
}

export interface IBookingFilters {
  status?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────────────
// Notification Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface INotification {
  id: string;
  userId: string;
  bookingId?: string;
  title: string;
  message: string;
  type: "booking_update" | "payment" | "review" | "system";
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────────────
// Pagination Interfaces
// ─────────────────────────────────────────────────────────────────────

export interface IPaginationQuery {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface IPaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
