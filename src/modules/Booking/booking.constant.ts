export const BookingErrors = {
  BOOKING_NOT_FOUND: "Booking not found",
  PROPERTY_NOT_FOUND: "Property not found",
  PROPERTY_NOT_APPROVED: "Property is not available for booking",
  CANNOT_BOOK_OWN_PROPERTY: "You cannot book your own property",
  DUPLICATE_BOOKING: "You already have an active booking for this property",
  INVALID_STATUS_TRANSITION: "Invalid booking status transition",
  UNAUTHORIZED: "You are not authorized to perform this action",
  CANNOT_CANCEL: "Booking cannot be cancelled at this stage",
  BOOKING_EXPIRED: "This booking request has expired",
  INVALID_DATE: "Move-in date must be in the future",
} as const;

export const BookingMessages = {
  BOOKING_CREATED: "Booking request submitted successfully",
  BOOKING_UPDATED: "Booking status updated successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_FETCHED: "Bookings fetched successfully",
  BOOKING_DETAIL_FETCHED: "Booking fetched successfully",
} as const;

// Pending bookings auto-expire after 24 hours
export const BOOKING_EXPIRY_HOURS = 24;