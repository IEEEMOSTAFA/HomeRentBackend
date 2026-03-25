// ================= OWNER CONSTANTS =================

export const OwnerSearchableFields = [
  "properties.title",
  "properties.description",
  "properties.city",
  "properties.area",
];

// Owner Success Messages
export const OwnerMessages = {
  PROFILE_FETCHED: "Owner profile fetched successfully",
  PROFILE_UPDATED: "Owner profile updated successfully",
  PROPERTY_CREATED: "Property created successfully",
  PROPERTY_UPDATED: "Property updated successfully",
  PROPERTY_DELETED: "Property deleted successfully",
  BOOKING_ACCEPTED: "Booking accepted successfully",
  BOOKING_DECLINED: "Booking declined successfully",
  REVIEW_FLAGGED: "Review flagged successfully",
  PROPERTIES_FETCHED: "Properties fetched successfully",
  BOOKINGS_FETCHED: "Bookings fetched successfully",
  REVIEWS_FETCHED: "Reviews fetched successfully",
  STATS_FETCHED: "Owner statistics fetched successfully",
};

// Owner Error Messages
export const OwnerErrors = {
  PROFILE_NOT_FOUND: "Owner profile not found",
  PROPERTY_NOT_FOUND: "Property not found",
  UNAUTHORIZED_PROPERTY: "You don't have permission to modify this property",
  INCOMPLETE_PROFILE: "Complete your owner profile before posting properties",
  PROPERTY_NOT_APPROVED: "Property must be approved by admin to receive bookings",
  BOOKING_NOT_FOUND: "Booking not found",
  INVALID_BOOKING_STATUS: "Invalid booking status transition",
  BOOKING_ALREADY_RESPONDED: "You have already responded to this booking",
  REVIEW_NOT_FOUND: "Review not found",
  INVALID_REVIEW_FLAG: "Invalid review flag action",
};

// Property Type Colors for UI
export const PropertyTypeLabels = {
  FAMILY_FLAT: "Family Flat",
  BACHELOR_ROOM: "Bachelor Room",
  SUBLET: "Sublet",
  HOSTEL: "Hostel",
  OFFICE_SPACE: "Office Space",
  COMMERCIAL: "Commercial",
};

// Property Status Labels
export const PropertyStatusLabels = {
  PENDING: "Pending Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Booking Status Labels
export const BookingStatusLabels = {
  PENDING: "Awaiting Response",
  ACCEPTED: "Accepted",
  PAYMENT_PENDING: "Payment Pending",
  CONFIRMED: "Confirmed",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
};

// Pagination defaults
export const OWNER_DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_PROPERTIES: 100,
  MAX_IMAGES_PER_PROPERTY: 10,
  MIN_NID_LENGTH: 10,
  MAX_NID_LENGTH: 20,
};