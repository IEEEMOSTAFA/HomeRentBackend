import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { UserMessages, UserErrors } from "./user.constant";
import {
  updateProfileValidationSchema,
  updateRoleValidationSchema,
} from "./user.validation";

// ================= USER CONTROLLERS =================

export const UserController = {
  // ================= PROFILE METHODS =================

  /**
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const user = await UserService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        message: UserMessages.USER_FETCHED,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const validation = updateProfileValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const updatedUser = await UserService.updateProfile(
        userId,
        validation.data
      );

      res.status(200).json({
        success: true,
        message: UserMessages.PROFILE_UPDATED,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= ROLE CHANGE METHODS =================

  /**
   * Change user role (USER ↔ OWNER)
   */
  async changeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const validation = updateRoleValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const updatedUser = await UserService.changeRole(userId, validation.data);

      res.status(200).json({
        success: true,
        message: UserMessages.ROLE_CHANGED,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= ADMIN METHODS =================

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const role = req.query.role as string;
      const search = req.query.search as string;

      const result = await UserService.getAllUsers(
        page,
        pageSize,
        role,
        search
      );

      res.status(200).json({
        success: true,
        message: UserMessages.USERS_FETCHED,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ban a user (Admin only)
   */
  async banUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const { isBanned } = req.body;

      if (typeof isBanned !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isBanned must be a boolean",
        });
      }

      const updatedUser = await UserService.banUser(userId, isBanned);

      const message = isBanned
        ? UserMessages.USER_BANNED
        : UserMessages.USER_UNBANNED;

      res.status(200).json({
        success: true,
        message,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a user (Admin only)
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;

      await UserService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: UserMessages.USER_DELETED,
        data: { id: userId },
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= STATS METHODS =================

  /**
   * Get user statistics
   */
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const stats = await UserService.getUserStats(userId);

      res.status(200).json({
        success: true,
        message: "User statistics fetched",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};