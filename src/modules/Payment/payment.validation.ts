import { z } from "zod";

// ================= PAYMENT VALIDATION SCHEMAS =================

/**
 * Create Payment Intent Schema
 * User initiates payment for a booking
 */
export const createPaymentIntentSchema = z.object({
  body: z.object({
    bookingId: z.string().cuid().describe("Booking ID"),
  }),
});

export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>["body"];

/**
 * Confirm Payment Schema
 * User confirms payment after Stripe frontend completes
 */
export const confirmPaymentSchema = z.object({
  body: z.object({
    paymentIntentId: z
      .string()
      .min(1, "Payment Intent ID is required")
      .describe("Stripe Payment Intent ID"),
    bookingId: z.string().cuid().optional().describe("Booking ID"), // optional — service finds booking via paymentIntentId
  }),
});

export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>["body"];

/**
 * Get Payment by Booking ID Schema
 */
export const getPaymentByBookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().cuid().describe("Booking ID"),
  }),
});

export type GetPaymentByBookingIdInput = z.infer<
  typeof getPaymentByBookingIdSchema
>["params"];

/**
 * Get Payment by ID Schema
 */
export const getPaymentByIdSchema = z.object({
  params: z.object({
    id: z.string().cuid().describe("Payment ID"),
  }),
});

export type GetPaymentByIdInput = z.infer<typeof getPaymentByIdSchema>["params"];

/**
 * Get All Payments Schema (Admin)
 * Query parameters for filtering and pagination
 */
export const getAllPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .describe("Page number"),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20)
      .describe("Page size"),
    status: z
      .enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
      .optional()
      .describe("Filter by payment status"),
    userId: z
      .string()
      .cuid()
      .optional()
      .describe("Filter by user ID"),
    sortBy: z
      .enum(["createdAt", "amount", "status"])
      .default("createdAt")
      .describe("Sort by field"),
    sortOrder: z
      .enum(["asc", "desc"])
      .default("desc")
      .describe("Sort order"),
  }),
});

export type GetAllPaymentsInput = z.infer<typeof getAllPaymentsSchema>["query"];

/**
 * Get My Payments Schema (User)
 * Query parameters for user's own payments
 */
export const getMyPaymentsSchema = z.object({
  query: z.object({
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .describe("Page number"),
    pageSize: z.coerce
      .number()
      .int()
      .positive()
      .max(100)
      .default(20)
      .describe("Page size"),
    status: z
      .enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
      .optional()
      .describe("Filter by payment status"),
    sortBy: z
      .enum(["createdAt", "amount"])
      .default("createdAt")
      .describe("Sort by field"),
    sortOrder: z
      .enum(["asc", "desc"])
      .default("desc")
      .describe("Sort order"),
  }),
});

export type GetMyPaymentsInput = z.infer<typeof getMyPaymentsSchema>["query"];

/**
 * Refund Payment Schema (Admin only)
 */
export const refundPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().cuid().describe("Payment ID"),
    refundAmount: z
      .number()
      .positive("Refund amount must be positive")
      .optional()
      .describe("Refund amount (optional, defaults to full amount)"),
    reason: z
      .string()
      .max(500, "Reason must be less than 500 characters")
      .optional()
      .describe("Refund reason"),
  }),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>["body"];

// ================= STRIPE WEBHOOK VALIDATION =================

/**
 * Stripe Webhook Signature Validation
 * (Validated in controller before processing)
 */
export const stripeWebhookSchema = z.object({
  id: z.string().describe("Stripe event ID"),
  type: z.enum([
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "charge.refunded",
  ]),
  data: z.object({
    object: z.object({
      id: z.string().describe("Payment Intent ID"),
      client_secret: z.string(),
      status: z.enum(["succeeded", "processing", "requires_payment_method"]),
      amount: z.number(),
      currency: z.string(),
      metadata: z.record(z.string(), z.string()).optional(),
    }),
  }),
});

export type StripeWebhookEventInput = z.infer<typeof stripeWebhookSchema>;
















































// import { z } from "zod";

// // ================= PAYMENT VALIDATION SCHEMAS =================

// /**
//  * Create Payment Intent Schema
//  * User initiates payment for a booking
//  */
// export const createPaymentIntentSchema = z.object({
//   body: z.object({
//     bookingId: z.string().cuid().describe("Booking ID"),
//   }),
// });

// export type CreatePaymentIntentInput = z.infer<
//   typeof createPaymentIntentSchema
// >["body"];

// /**
//  * Confirm Payment Schema
//  * User confirms payment after Stripe frontend completes
//  */
// export const confirmPaymentSchema = z.object({
//   body: z.object({
//     paymentIntentId: z
//       .string()
//       .min(1, "Payment Intent ID is required")
//       .describe("Stripe Payment Intent ID"),
//     bookingId: z.string().cuid().describe("Booking ID"),
//   }),
// });

// export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>["body"];

// /**
//  * Get Payment by Booking ID Schema
//  */
// export const getPaymentByBookingIdSchema = z.object({
//   params: z.object({
//     bookingId: z.string().cuid().describe("Booking ID"),
//   }),
// });

// export type GetPaymentByBookingIdInput = z.infer<
//   typeof getPaymentByBookingIdSchema
// >["params"];

// /**
//  * Get Payment by ID Schema
//  */
// export const getPaymentByIdSchema = z.object({
//   params: z.object({
//     id: z.string().cuid().describe("Payment ID"),
//   }),
// });

// export type GetPaymentByIdInput = z.infer<typeof getPaymentByIdSchema>["params"];

// /**
//  * Get All Payments Schema (Admin)
//  * Query parameters for filtering and pagination
//  */
// export const getAllPaymentsSchema = z.object({
//   query: z.object({
//     page: z.coerce
//       .number()
//       .int()
//       .positive()
//       .default(1)
//       .describe("Page number"),
//     pageSize: z.coerce
//       .number()
//       .int()
//       .positive()
//       .max(100)
//       .default(20)
//       .describe("Page size"),
//     status: z
//       .enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
//       .optional()
//       .describe("Filter by payment status"),
//     userId: z
//       .string()
//       .cuid()
//       .optional()
//       .describe("Filter by user ID"),
//     sortBy: z
//       .enum(["createdAt", "amount", "status"])
//       .default("createdAt")
//       .describe("Sort by field"),
//     sortOrder: z
//       .enum(["asc", "desc"])
//       .default("desc")
//       .describe("Sort order"),
//   }),
// });

// export type GetAllPaymentsInput = z.infer<typeof getAllPaymentsSchema>["query"];

// /**
//  * Get My Payments Schema (User)
//  * Query parameters for user's own payments
//  */
// export const getMyPaymentsSchema = z.object({
//   query: z.object({
//     page: z.coerce
//       .number()
//       .int()
//       .positive()
//       .default(1)
//       .describe("Page number"),
//     pageSize: z.coerce
//       .number()
//       .int()
//       .positive()
//       .max(100)
//       .default(20)
//       .describe("Page size"),
//     status: z
//       .enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"])
//       .optional()
//       .describe("Filter by payment status"),
//     sortBy: z
//       .enum(["createdAt", "amount"])
//       .default("createdAt")
//       .describe("Sort by field"),
//     sortOrder: z
//       .enum(["asc", "desc"])
//       .default("desc")
//       .describe("Sort order"),
//   }),
// });

// export type GetMyPaymentsInput = z.infer<typeof getMyPaymentsSchema>["query"];

// /**
//  * Refund Payment Schema (Admin only)
//  */
// export const refundPaymentSchema = z.object({
//   body: z.object({
//     paymentId: z.string().cuid().describe("Payment ID"),
//     refundAmount: z
//       .number()
//       .positive("Refund amount must be positive")
//       .optional()
//       .describe("Refund amount (optional, defaults to full amount)"),
//     reason: z
//       .string()
//       .max(500, "Reason must be less than 500 characters")
//       .optional()
//       .describe("Refund reason"),
//   }),
// });

// export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>["body"];

// // ================= STRIPE WEBHOOK VALIDATION =================

// /**
//  * Stripe Webhook Signature Validation
//  * (Validated in controller before processing)
//  */
// export const stripeWebhookSchema = z.object({
//   id: z.string().describe("Stripe event ID"),
//   type: z.enum([
//     "payment_intent.succeeded",
//     "payment_intent.payment_failed",
//     "payment_intent.canceled",
//     "charge.refunded",
//   ]),
//   data: z.object({
//     object: z.object({
//       id: z.string().describe("Payment Intent ID"),
//       client_secret: z.string(),
//       status: z.enum(["succeeded", "processing", "requires_payment_method"]),
//       amount: z.number(),
//       currency: z.string(),
//       metadata: z.record(z.string(), z.string()).optional(),
//     }),
//   }),
// });

// export type StripeWebhookEventInput = z.infer<typeof stripeWebhookSchema>;