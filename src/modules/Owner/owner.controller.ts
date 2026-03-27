import { Request, Response, NextFunction } from "express";
import catchAsync from "../../shared/catchAsync";
// import { sendResponse } from "../../shared/sendResponse";
import { AppError } from "../../errorsHelpers/AppError";
import { OwnerService } from "./owner.service";
import { OwnerMessages, OwnerErrors } from "./owner.constant";
import {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
  updateOwnerProfileValidationSchema,
  respondToBookingValidationSchema,
  flagReviewValidationSchema,
} from "./owner.validation";
import { sendResponse } from "../../shared";

// ================= OWNER PROFILE CONTROLLERS =================

const getOwnerProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const ownerProfile = await OwnerService.getOwnerProfileFromDB(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROFILE_FETCHED,
    data: ownerProfile,
  });
});

const updateOwnerProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  
  if (!userId) {
    throw new AppError("User not authenticated", 401);
  }

  const validation = updateOwnerProfileValidationSchema.safeParse(req.body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    const errorMessages = [
      ...Object.values(flattened.fieldErrors).flat(),
      ...Object.values(flattened.formErrors).flat(),
    ].join(", ");
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  const updatedProfile = await OwnerService.updateOwnerProfileIntoDB(
    userId,
    validation.data
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROFILE_UPDATED,
    data: updatedProfile,
  });
});

// ================= PROPERTY CONTROLLERS =================

const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  const validation = createPropertyValidationSchema.safeParse(req.body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    const errorMessages = [
      ...Object.values(flattened.fieldErrors).flat(),
      ...Object.values(flattened.formErrors).flat(),
    ].join(", ");
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  const property = await OwnerService.createPropertyIntoDB(
    ownerId,
    validation.data
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: OwnerMessages.PROPERTY_CREATED,
    data: property,
  });
});

const getOwnerProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const status = req.query.status as string | undefined;

  const result = await OwnerService.getOwnerPropertiesFromDB(
    ownerId,
    page,
    pageSize,
    status
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROPERTIES_FETCHED,
    data: result.data,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id: propertyId } = req.params;
  
  if (!propertyId) {
    throw new AppError("Property ID is required", 400);
  }

  const property = await OwnerService.getPropertyByIdFromDB(propertyId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROPERTIES_FETCHED,
    data: property,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  const { id: propertyId } = req.params;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!propertyId) {
    throw new AppError("Property ID is required", 400);
  }

  const validation = updatePropertyValidationSchema.safeParse(req.body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    const errorMessages = [
      ...Object.values(flattened.fieldErrors).flat(),
      ...Object.values(flattened.formErrors).flat(),
    ].join(", ");
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  const property = await OwnerService.updatePropertyIntoDB(
    propertyId as string,
    ownerId,
    validation.data
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROPERTY_UPDATED,
    data: property,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  const { id: propertyId } = req.params;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!propertyId) {
    throw new AppError("Property ID is required", 400);
  }

  await OwnerService.deletePropertyFromDB(propertyId as string, ownerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.PROPERTY_DELETED,
    data: { id: propertyId },
  });
});

// ================= BOOKING CONTROLLERS =================

const getOwnerBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const status = req.query.status as string | undefined;

  const result = await OwnerService.getOwnerBookingsFromDB(
    ownerId,
    page,
    pageSize,
    status
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.BOOKINGS_FETCHED,
    data: result.data,
  });
});

const respondToBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  const { id: bookingId } = req.params;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!bookingId) {
    throw new AppError("Booking ID is required", 400);
  }

  const validation = respondToBookingValidationSchema.safeParse(req.body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    const errorMessages = [
      ...Object.values(flattened.fieldErrors).flat(),
      ...Object.values(flattened.formErrors).flat(),
    ].join(", ");
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  const booking = await OwnerService.respondToBookingIntoDB(
    bookingId as string,
    ownerId,
    validation.data
  );

  const message =
    validation.data.status === "ACCEPTED"
      ? OwnerMessages.BOOKING_ACCEPTED
      : OwnerMessages.BOOKING_DECLINED;

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message,
    data: booking,
  });
});

// ================= REVIEW CONTROLLERS =================

const getPropertyReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  const { propertyId } = req.params;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!propertyId) {
    throw new AppError("Property ID is required", 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const result = await OwnerService.getPropertyReviewsFromDB(
    propertyId as string,
    ownerId,
    page,
    pageSize
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.REVIEWS_FETCHED,
    data: result.data,
  });
});

const flagReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  const { id: reviewId } = req.params;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  if (!reviewId) {
    throw new AppError("Review ID is required", 400);
  }

  const validation = flagReviewValidationSchema.safeParse(req.body);
  if (!validation.success) {
    const flattened = validation.error.flatten();
    const errorMessages = [
      ...Object.values(flattened.fieldErrors).flat(),
      ...Object.values(flattened.formErrors).flat(),
    ].join(", ");
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }

  const review = await OwnerService.flagReviewIntoDB(
    reviewId as string,
    ownerId,
    validation.data
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.REVIEW_FLAGGED,
    data: review,
  });
});

// ================= STATS CONTROLLERS =================

const getOwnerStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const ownerId = req.user?.id;
  
  if (!ownerId) {
    throw new AppError("User not authenticated", 401);
  }

  const stats = await OwnerService.getOwnerStatsFromDB(ownerId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: OwnerMessages.STATS_FETCHED,
    data: stats,
  });
});

// ================= EXPORT ALL CONTROLLERS =================

export const OwnerController = {
  getOwnerProfile,
  updateOwnerProfile,
  createProperty,
  getOwnerProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getOwnerBookings,
  respondToBooking,
  getPropertyReviews,
  flagReview,
  getOwnerStats,
};