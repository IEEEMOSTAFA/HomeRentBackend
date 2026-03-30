import { z } from "zod";
import { NOTIFICATION_DEFAULTS } from "./notification.constant";

// ─── Param validation for /:id routes ────────────────────────────────────────
// Was MISSING in original file — caused runtime crashes in controller & service.
export const notificationIdParamSchema = z.object({
  id: z.string().cuid({ message: "Invalid notification id" }),
});

// ─── Body validation for internal createNotification helper ──────────────────
export const createNotificationSchema = z.object({
  userId: z.string().cuid({ message: "Invalid userId" }),
  bookingId: z.string().cuid({ message: "Invalid bookingId" }).optional(),
  title: z.string().min(1).max(150),
  message: z.string().min(1).max(1000),
  type: z.enum(["booking_update", "payment", "review", "system"]),
  actionUrl: z.string().url({ message: "Invalid actionUrl" }).optional(),
});

// ─── Query param validation for GET /api/notifications ───────────────────────
export const getNotificationsQuerySchema = z.object({
  isRead: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      return val === "true";
    }),

  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : NOTIFICATION_DEFAULTS.PAGE))
    .pipe(z.number().int().positive()),

  limit: z
    .string()
    .optional()
    .transform((val) =>
      val ? parseInt(val, 10) : NOTIFICATION_DEFAULTS.LIMIT
    )
    .pipe(z.number().int().positive().max(100)),
});

// ─── Inferred types ───────────────────────────────────────────────────────────
export type TGetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
export type TCreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type TNotificationIdParam = z.infer<typeof notificationIdParamSchema>;