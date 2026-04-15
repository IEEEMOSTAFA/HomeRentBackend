// import express, { Router } from "express";
// import { PaymentController } from "./payment.controller";
// import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

// const router = Router();

// // ─────────────────────────────────────────────────────────────────────────────
// // PUBLIC - Stripe Webhook (MUST use raw body, NO auth)
// // Register this BEFORE any json() middleware in your app.ts
// // ─────────────────────────────────────────────────────────────────────────────
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   PaymentController.stripeWebhook
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // USER Routes - Payment Management
// // ─────────────────────────────────────────────────────────────────────────────

// // POST /api/payments/create-intent  → user initiates payment (gets clientSecret)
// router.post(
//   "/create-intent",
//   verifyAuth,
//   roleGuard([UserRole.USER]),
//   PaymentController.createPaymentIntent
// );

// // POST /api/payments/confirm  → user confirms after Stripe frontend success
// router.post(
//   "/confirm",
//   verifyAuth,
//   roleGuard([UserRole.USER]),
//   PaymentController.confirmPayment
// );

// // GET /api/payments/my-payments  → user sees their own payments
// router.get(
//   "/my-payments",
//   verifyAuth,
//   roleGuard([UserRole.USER]),
//   PaymentController.getMyPayments
// );

// // GET /api/payments/booking/:bookingId  → user/admin gets payment by bookingId
// router.get(
//   "/booking/:bookingId",
//   verifyAuth,
//   roleGuard([UserRole.USER, UserRole.ADMIN, UserRole.OWNER]),
//   PaymentController.getPaymentByBookingId
// );

// // GET /api/payments/:id  → user/admin gets payment by paymentId
// router.get(
//   "/:id",
//   verifyAuth,
//   roleGuard([UserRole.USER, UserRole.ADMIN, UserRole.OWNER]),
//   PaymentController.getPaymentById
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // ADMIN Routes - Payment Administration
// // ─────────────────────────────────────────────────────────────────────────────

// // GET /api/payments  → admin sees all payments (with filters)
// router.get(
//   "/",
//   verifyAuth,
//   roleGuard([UserRole.ADMIN]),
//   PaymentController.getAllPayments
// );

// // POST /api/payments/:id/refund  → admin processes refund
// router.post(
//   "/:id/refund",
//   verifyAuth,
//   roleGuard([UserRole.ADMIN]),
//   PaymentController.refundPayment
// );

// export const PaymentRoutes = router;






















// test file :

import express, { Router } from "express";
import { PaymentController } from "./payment.controller";
import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

const router = Router();

// PUBLIC - Webhook
router.post("/webhook", express.raw({ type: "application/json" }), PaymentController.stripeWebhook);

// USER Routes
router.post("/create-intent", verifyAuth, roleGuard([UserRole.USER]), PaymentController.createPaymentIntent);
router.post("/confirm", verifyAuth, roleGuard([UserRole.USER]), PaymentController.confirmPayment);

// ✅ CRITICAL FIX: specific routes আগে, /:id সবার শেষে
router.get("/my-payments", verifyAuth, roleGuard([UserRole.USER]), PaymentController.getMyPayments);
router.get("/booking/:bookingId", verifyAuth, roleGuard([UserRole.USER, UserRole.ADMIN, UserRole.OWNER]), PaymentController.getPaymentByBookingId);
router.get("/", verifyAuth, roleGuard([UserRole.ADMIN]), PaymentController.getAllPayments);
router.post("/:id/refund", verifyAuth, roleGuard([UserRole.ADMIN]), PaymentController.refundPayment);

// ✅ Dynamic route সবার শেষে
router.get("/:id", verifyAuth, roleGuard([UserRole.USER, UserRole.ADMIN, UserRole.OWNER]), PaymentController.getPaymentById);

export const PaymentRoutes = router;