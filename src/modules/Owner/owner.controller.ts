import { Request, Response, NextFunction } from "express";
import { OwnerService } from "./owner.service";
import { OwnerMessages, OwnerErrors } from "./owner.constant";
import {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
  updateOwnerProfileValidationSchema,
  respondToBookingValidationSchema,
  flagReviewValidationSchema,
} from "./owner.validation";

// ================= OWNER PROFILE CONTROLLERS =================

export const OwnerController = {
  // Get Owner Profile
  async getOwnerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const ownerProfile = await OwnerService.getOwnerProfile(userId);

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROFILE_FETCHED,
        data: ownerProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Owner Profile
  async updateOwnerProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id!;

      const validation = updateOwnerProfileValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const updatedProfile = await OwnerService.updateOwnerProfile(
        userId,
        validation.data
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROFILE_UPDATED,
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= PROPERTY CONTROLLERS =================

  // Create Property
  async createProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;

      const validation = createPropertyValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const property = await OwnerService.createProperty(
        ownerId,
        validation.data
      );

      res.status(201).json({
        success: true,
        message: OwnerMessages.PROPERTY_CREATED,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Owner's Properties
  async getOwnerProperties(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const status = req.query.status as string;

      const result = await OwnerService.getOwnerProperties(
        ownerId,
        page,
        pageSize,
        status
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROPERTIES_FETCHED,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get Single Property
  async getPropertyById(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.params.id;

      const property = await OwnerService.getPropertyById(propertyId);

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROPERTIES_FETCHED,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update Property
  async updateProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const propertyId = req.params.id;

      const validation = updatePropertyValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const property = await OwnerService.updateProperty(
        propertyId,
        ownerId,
        validation.data
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROPERTY_UPDATED,
        data: property,
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete Property
  async deleteProperty(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const propertyId = req.params.id;

      await OwnerService.deleteProperty(propertyId, ownerId);

      res.status(200).json({
        success: true,
        message: OwnerMessages.PROPERTY_DELETED,
        data: { id: propertyId },
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= BOOKING CONTROLLERS =================

  // Get Owner's Bookings
  async getOwnerBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const status = req.query.status as string;

      const result = await OwnerService.getOwnerBookings(
        ownerId,
        page,
        pageSize,
        status
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.BOOKINGS_FETCHED,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // Respond to Booking
  async respondToBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const bookingId = req.params.id;

      const validation = respondToBookingValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const booking = await OwnerService.respondToBooking(
        bookingId,
        ownerId,
        validation.data
      );

      const message =
        validation.data.status === "ACCEPTED"
          ? OwnerMessages.BOOKING_ACCEPTED
          : OwnerMessages.BOOKING_DECLINED;

      res.status(200).json({
        success: true,
        message,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= REVIEW CONTROLLERS =================

  // Get Property Reviews
  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const propertyId = req.params.propertyId;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;

      const result = await OwnerService.getPropertyReviews(
        propertyId,
        ownerId,
        page,
        pageSize
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.REVIEWS_FETCHED,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // Flag Review
  async flagReview(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;
      const reviewId = req.params.id;

      const validation = flagReviewValidationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        });
      }

      const review = await OwnerService.flagReview(
        reviewId,
        ownerId,
        validation.data
      );

      res.status(200).json({
        success: true,
        message: OwnerMessages.REVIEW_FLAGGED,
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  // ================= STATS CONTROLLERS =================

  // Get Owner Stats
  async getOwnerStats(req: Request, res: Response, next: NextFunction) {
    try {
      const ownerId = req.user?.id!;

      const stats = await OwnerService.getOwnerStats(ownerId);

      res.status(200).json({
        success: true,
        message: OwnerMessages.STATS_FETCHED,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};