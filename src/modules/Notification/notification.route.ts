import { Router } from "express";
import { NotificationController } from "./notification.controller";
import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

const router = Router();

// ─── Auth guard ───────────────────────────────────────────────────────────────
// verifyAuth  → validates session, emailVerified, isActive, isBanned
// roleGuard   → restricts to USER and OWNER (no Admin-only routes here)
router.use(verifyAuth);
router.use(roleGuard([UserRole.USER, UserRole.OWNER]));

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/notifications
 * Query params: isRead (true|false), page, limit
 *
 * USER  → booking-accepted, payment-confirmed, etc.
 * OWNER → booking-request, review-flagged, payment-received, etc.
 */
router.get("/", NotificationController.getMyNotifications);

/**
 * PATCH /api/notifications/mark-all-read
 * Declared BEFORE /:id to prevent Express matching "mark-all-read" as :id.
 */
router.patch("/mark-all-read", NotificationController.markAllAsRead);

/**
 * PATCH /api/notifications/:id/read
 * Sets isRead = true. Ownership enforced in service layer.
 */
router.patch("/:id/read", NotificationController.markAsRead);

/**
 * DELETE /api/notifications/:id
 * Permanently removes a notification the caller owns.
 */
router.delete("/:id", NotificationController.deleteNotification);

export const NotificationRoutes = router;