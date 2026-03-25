// ================= SEARCHABLE FIELDS =================
export const AdminSearchableFields = [
  "users.name",
  "users.email",
  "properties.title",
  "properties.city",
  "properties.area",
];

// ================= ADMIN MESSAGES =================
export const AdminMessages = {
  PROPERTY_APPROVED: "Property approved successfully",
  PROPERTY_REJECTED: "Property rejected successfully",
  PROPERTY_DELETED: "Property deleted successfully",
  USER_BANNED: "User banned successfully",
  USER_UNBANNED: "User unbanned successfully",
  USER_DELETED: "User deleted successfully",
  OWNER_VERIFIED: "Owner verified successfully",
  OWNER_UNVERIFIED: "Owner unverified",
  UNVERIFIED_OWNERS_FETCHED: "Unverified owners fetched successfully",
  REVIEW_HIDDEN: "Review hidden successfully",
  REVIEW_UNHIDDEN: "Review unhidden successfully",
  FLAGGED_REVIEWS_FETCHED: "Flagged reviews fetched successfully",
  PAYMENT_REFUNDED: "Payment refunded successfully",
  PAYMENTS_FETCHED: "All payments fetched successfully",
  BLOG_CREATED: "Blog post created successfully",
  BLOG_UPDATED: "Blog post updated successfully",
  BLOG_PUBLISHED: "Blog post published successfully",
  BLOG_UNPUBLISHED: "Blog post unpublished",
  BLOG_DELETED: "Blog post deleted successfully",
  BLOG_POSTS_FETCHED: "Blog posts fetched successfully",
  ANALYTICS_FETCHED: "Analytics data fetched successfully",
  PENDING_PROPERTIES_FETCHED: "Pending properties fetched successfully",
  ALL_BOOKINGS_FETCHED: "All bookings fetched successfully",
  ALL_USERS_FETCHED: "All users fetched successfully",
};

// ================= ADMIN ERRORS =================
export const AdminErrors = {
  PROPERTY_NOT_FOUND: "Property not found",
  USER_NOT_FOUND: "User not found",
  BOOKING_NOT_FOUND: "Booking not found",
  PAYMENT_NOT_FOUND: "Payment not found",
  REVIEW_NOT_FOUND: "Review not found",
  BLOG_POST_NOT_FOUND: "Blog post not found",
  PAYMENT_ALREADY_PROCESSED: "Payment already processed",
  INSUFFICIENT_FUNDS: "Insufficient funds for refund",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  UNAUTHORIZED: "Unauthorized action",
  INVALID_REJECTION_REASON: "Rejection reason required when rejecting property",
};

// ================= STATUS LABELS =================
export const PropertyStatusLabels = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const BookingStatusLabels = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  PAYMENT_PENDING: "Payment Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

export const PaymentStatusLabels = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

// ================= ADMIN DEFAULTS =================
export const ADMIN_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_REJECTION_REASON_LENGTH: 500,
  MIN_REJECTION_REASON_LENGTH: 10,
};

// ================= PROPERTY STATUS ENUM =================
export enum PropertyStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}