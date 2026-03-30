import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import {
  ICreateNotificationPayload,
  IGetNotificationsQuery,
  INotificationListData,
  INotification,
} from "./notification.interface";

// ─── CREATE (internal — called by booking/payment/review services) ────────────

const createNotification = async (
  payload: ICreateNotificationPayload
): Promise<INotification> => {
  const notification = await prisma.notification.create({
    data: {
      userId:    payload.userId,
      bookingId: payload.bookingId ?? null,
      title:     payload.title,
      message:   payload.message,
      type:      payload.type,
      actionUrl: payload.actionUrl ?? null,
    },
  });

  return notification as INotification;
};

// ─── GET /api/notifications ───────────────────────────────────────────────────

const getMyNotifications = async (
  userId: string,
  query: IGetNotificationsQuery
): Promise<INotificationListData> => {
  const { isRead, page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(isRead !== undefined && { isRead }),
  };

  const [notifications, total, unreadCount] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications: notifications as INotification[],
    total,
    unreadCount,
    page,
    limit,
  };
};

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────

const markAsRead = async (
  id: string,
  userId: string
): Promise<INotification> => {
  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new AppError("Notification not found", httpStatus.NOT_FOUND);
  }

  // Ownership check — user cannot mark someone else's notification
  if (notification.userId !== userId) {
    throw new AppError(
      "You are not allowed to update this notification",
      httpStatus.FORBIDDEN
    );
  }

  // Already read — return as-is (idempotent)
  if (notification.isRead) {
    return notification as INotification;
  }

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return updated as INotification;
};

// ─── PATCH /api/notifications/mark-all-read ──────────────────────────────────

const markAllAsRead = async (userId: string): Promise<{ count: number }> => {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });

  return { count: result.count };
};

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────

const deleteNotification = async (
  id: string,
  userId: string
): Promise<void> => {
  const notification = await prisma.notification.findUnique({ where: { id } });

  if (!notification) {
    throw new AppError("Notification not found", httpStatus.NOT_FOUND);
  }

  // Ownership check — user cannot delete someone else's notification
  if (notification.userId !== userId) {
    throw new AppError(
      "You are not allowed to delete this notification",
      httpStatus.FORBIDDEN
    );
  }

  await prisma.notification.delete({ where: { id } });
};

// ─── Exports ──────────────────────────────────────────────────────────────────

export const NotificationService = {
  createNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};