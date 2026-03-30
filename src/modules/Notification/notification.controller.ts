import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync, sendResponse } from "../../shared";
import { NotificationService } from "./notification.service";
import {
  getNotificationsQuerySchema,
  notificationIdParamSchema,
} from "./notification.validation";

// ─── GET /api/notifications ───────────────────────────────────────────────────
const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const query = getNotificationsQuerySchema.parse(req.query);

  const data = await NotificationService.getMyNotifications(userId, query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data,
  });
});

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = notificationIdParamSchema.parse(req.params);

  const result = await NotificationService.markAsRead(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification marked as read",
    data: result,
  });
});

// ─── PATCH /api/notifications/mark-all-read ──────────────────────────────────
const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await NotificationService.markAllAsRead(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${result.count} notification(s) marked as read`,
    data: result,
  });
});

// ─── DELETE /api/notifications/:id ───────────────────────────────────────────
const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = notificationIdParamSchema.parse(req.params);

  await NotificationService.deleteNotification(id, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification deleted successfully",
    data: null,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};