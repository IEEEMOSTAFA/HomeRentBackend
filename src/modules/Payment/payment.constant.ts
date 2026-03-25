// ================= PAYMENT MESSAGES =================
export const PaymentMessages = {
  // Success messages
  PAYMENT_INTENT_CREATED: "Payment intent created successfully",
  PAYMENT_CONFIRMED: "Payment confirmed successfully",
  PAYMENT_INTENT_RETRIEVED: "Payment intent retrieved successfully",
  PAYMENT_FETCHED: "Payment fetched successfully",
  ALL_PAYMENTS_FETCHED: "All payments fetched successfully",
  MY_PAYMENTS_FETCHED: "Your payments fetched successfully",
  PAYMENT_REFUNDED: "Payment refunded successfully",
  WEBHOOK_PROCESSED: "Webhook processed successfully",

  // Payment status messages
  PAYMENT_SUCCESS: "Your payment was successful",
  PAYMENT_PENDING: "Your payment is pending",
  PAYMENT_FAILED: "Your payment failed",
  PAYMENT_REFUNDED_MSG: "Your payment has been refunded",
};

// ================= PAYMENT ERRORS =================
export const PaymentErrors = {
  // Not found
  PAYMENT_NOT_FOUND: "Payment not found",
  BOOKING_NOT_FOUND: "Booking not found",
  USER_NOT_FOUND: "User not found",

  // Stripe errors
  PAYMENT_INTENT_FAILED: "Payment intent creation failed",
  STRIPE_ERROR: "Stripe processing error",
  INVALID_PAYMENT_METHOD: "Invalid payment method",
  INSUFFICIENT_FUNDS: "Insufficient funds for payment",
  CARD_DECLINED: "Card was declined",

  // Business logic errors
  PAYMENT_ALREADY_PROCESSED: "Payment already processed",
  INVALID_BOOKING_STATUS: "Booking status does not allow payment",
  REFUND_NOT_ALLOWED: "Refund is not allowed for this payment",
  INVALID_REFUND_AMOUNT: "Refund amount exceeds payment amount",
  PAYMENT_NOT_CONFIRMED: "Payment has not been confirmed",

  // Authorization errors
  UNAUTHORIZED_ACCESS: "You do not have access to this payment",
  UNAUTHORIZED_REFUND: "Only admins can process refunds",

  // Validation errors
  INVALID_AMOUNT: "Invalid payment amount",
  INVALID_CURRENCY: "Invalid currency",
};

// ================= STRIPE CONFIGURATION =================
export const StripeConfig = {
  API_VERSION: "2024-04-10",
  WEBHOOK_EVENTS: ["payment_intent.succeeded", "payment_intent.payment_failed"],
  STATEMENT_DESCRIPTOR: "HomeRent Property Booking",
  METADATA_KEYS: {
    BOOKING_ID: "bookingId",
    USER_ID: "userId",
    PROPERTY_ID: "propertyId",
  },
};

// ================= PAYMENT STATUS LABELS =================
export const PaymentStatusLabels = {
  PENDING: "Pending",
  SUCCESS: "Successful",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

// ================= PAYMENT DEFAULTS =================
export const PaymentDefaults = {
  PAGE_SIZE: 20,
  CURRENCY: "BDT",
  PLATFORM_FEE_PERCENTAGE: 5, // 5% platform fee
  MIN_PAYMENT_AMOUNT: 1,
  MAX_PAYMENT_AMOUNT: 1000000,
  PAYMENT_EXPIRY_MINUTES: 15, // PaymentIntent expires after 15 minutes
};

// ================= QUERY FILTERS =================
export const PaymentSearchableFields = [
  "status",
  "userId",
  "bookingId",
];

export const PaymentFilterOptions = {
  status: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
  sortBy: ["createdAt", "amount", "status"],
  sortOrder: ["asc", "desc"],
};