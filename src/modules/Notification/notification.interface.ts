// ─── Notification Interface ───────────────────────────────────────────────────
// Mirrors the Prisma Notification model + helper types used across the module.

export interface INotification {
  id: string;
  userId: string;
  bookingId?: string | null;
  title: string;
  message: string;
  type: TNotificationType;
  isRead: boolean;
  actionUrl?: string | null;
  createdAt: Date;
}

// Union type matching the free-text `type` column in schema
export type TNotificationType =
  | "booking_update"
  | "payment"
  | "review"
  | "system";

// ─── Service layer params ─────────────────────────────────────────────────────

export interface ICreateNotificationPayload {
  userId: string;
  bookingId?: string;
  title: string;
  message: string;
  type: TNotificationType;
  actionUrl?: string;
}

export interface IGetNotificationsQuery {
  /** Filter by read/unread. Omit to get all. */
  isRead?: boolean;
  /** Page number (1-indexed). Defaults to 1. */
  page?: number;
  /** Items per page. Defaults to 20. */
  limit?: number;
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface INotificationListData {
  notifications: INotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}