// ─── Notification Constants ───────────────────────────────────────────────────

/** All valid notification type values (matches schema free-text column). */
export const NOTIFICATION_TYPES = [
  "booking_update",
  "payment",
  "review",
  "system",
] as const;

/** Default pagination values for GET /api/notifications */
export const NOTIFICATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
} as const;

// ─── Reusable notification title / message templates ─────────────────────────
// Call the factory functions from service/webhook layers to stay DRY.

export const NOTIFICATION_TEMPLATES = {
  // ── Booking ──────────────────────────────────────────────────────────────
  BOOKING_RECEIVED: (propertyTitle: string) => ({
    title: "New Booking Request",
    message: `You have received a new booking request for "${propertyTitle}".`,
    type: "booking_update" as const,
  }),
  BOOKING_ACCEPTED: (propertyTitle: string) => ({
    title: "Booking Accepted",
    message: `Your booking request for "${propertyTitle}" has been accepted. Please complete the payment to confirm.`,
    type: "booking_update" as const,
  }),
  BOOKING_DECLINED: (propertyTitle: string) => ({
    title: "Booking Declined",
    message: `Your booking request for "${propertyTitle}" has been declined by the owner.`,
    type: "booking_update" as const,
  }),
  BOOKING_CANCELLED: (propertyTitle: string) => ({
    title: "Booking Cancelled",
    message: `The booking for "${propertyTitle}" has been cancelled.`,
    type: "booking_update" as const,
  }),

  // ── Payment ───────────────────────────────────────────────────────────────
  PAYMENT_SUCCESS: (propertyTitle: string) => ({
    title: "Payment Confirmed",
    message: `Payment for your booking at "${propertyTitle}" was successful. Your booking is now confirmed!`,
    type: "payment" as const,
  }),
  PAYMENT_FAILED: (propertyTitle: string) => ({
    title: "Payment Failed",
    message: `Payment for your booking at "${propertyTitle}" has failed. Please try again.`,
    type: "payment" as const,
  }),
  PAYMENT_RECEIVED_OWNER: (propertyTitle: string) => ({
    title: "Payment Received",
    message: `A tenant has completed payment for "${propertyTitle}". The booking is now confirmed.`,
    type: "payment" as const,
  }),

  // ── Review ────────────────────────────────────────────────────────────────
  REVIEW_FLAGGED: (propertyTitle: string) => ({
    title: "Review Flagged for Moderation",
    message: `A review for "${propertyTitle}" has been flagged by the owner and requires your attention.`,
    type: "review" as const,
  }),
  NEW_REVIEW: (propertyTitle: string) => ({
    title: "New Review Posted",
    message: `A tenant has left a review for your property "${propertyTitle}".`,
    type: "review" as const,
  }),

  // ── System ────────────────────────────────────────────────────────────────
  PROPERTY_APPROVED: (propertyTitle: string) => ({
    title: "Property Approved",
    message: `Your property listing "${propertyTitle}" has been approved and is now live.`,
    type: "system" as const,
  }),
  PROPERTY_REJECTED: (propertyTitle: string, reason: string) => ({
    title: "Property Rejected",
    message: `Your property listing "${propertyTitle}" was rejected. Reason: ${reason}`,
    type: "system" as const,
  }),
} as const;