import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import {
  getPendingPropertiesFromDB,
  approvePropertyIntoDB,
  deletePropertyFromDB,
  verifyOwnerIntoDB,
  getUnverifiedOwnersFromDB,
  getFlaggedReviewsFromDB,
  hideReviewIntoDB,
  refundPaymentIntoDB,
  getAllPaymentsFromDB,
  createBlogPostIntoDB,
  updateBlogPostIntoDB,
  publishBlogPostIntoDB,
  deleteBlogPostFromDB,
  getAllBlogPostsFromDB,
  getAnalyticsFromDB,
} from "./admin.service";
import { AdminMessages, AdminErrors } from "./admin.constant";
import {
  approvePropertyValidationSchema,
  verifyOwnerValidationSchema,
  hideReviewValidationSchema,
  refundPaymentValidationSchema,
  createBlogValidationSchema,
  updateBlogValidationSchema,
  publishBlogValidationSchema,
} from "./admin.validation";
import AppError from "../../errors/AppError";

// ================= UTILITY FUNCTIONS =================

const handleValidationError = (
  res: Response,
  errors: any
) => {
  return res.status(httpStatus.BAD_REQUEST).json({
    success: false,
    message: "Validation error",
    errors: errors.flatten(),
  });
};

// ================= PROPERTY MODERATION HANDLERS =================

const getPendingPropertiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const search = req.query.search as string;

    const result = await getPendingPropertiesFromDB(
      page,
      pageSize,
      search
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.PENDING_PROPERTIES_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const approvePropertyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyId = req.params.id as string;

    const validation = approvePropertyValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const property = await approvePropertyIntoDB(
      propertyId,
      validation.data
    );

    const message =
      validation.data.status === "APPROVED"
        ? AdminMessages.PROPERTY_APPROVED
        : AdminMessages.PROPERTY_REJECTED;

    res.status(httpStatus.OK).json({
      success: true,
      message,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

const deletePropertyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const propertyId = req.params.id as string;

    await deletePropertyFromDB(propertyId);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.PROPERTY_DELETED,
      data: { id: propertyId },
    });
  } catch (error) {
    next(error);
  }
};

// ================= OWNER VERIFICATION HANDLERS =================

const verifyOwnerHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.params.id as string;

    const validation = verifyOwnerValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const ownerProfile = await verifyOwnerIntoDB(
      ownerId,
      validation.data
    );

    const message = validation.data.verified
      ? AdminMessages.OWNER_VERIFIED
      : AdminMessages.OWNER_UNVERIFIED;

    res.status(httpStatus.OK).json({
      success: true,
      message,
      data: ownerProfile,
    });
  } catch (error) {
    next(error);
  }
};

const getUnverifiedOwnersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await getUnverifiedOwnersFromDB(page, pageSize);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.UNVERIFIED_OWNERS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ================= REVIEW MANAGEMENT HANDLERS =================

const getFlaggedReviewsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await getFlaggedReviewsFromDB(page, pageSize);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.FLAGGED_REVIEWS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const hideReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviewId = req.params.id as string;

    const validation = hideReviewValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const review = await hideReviewIntoDB(reviewId, validation.data);

    const message = validation.data.isVisible
      ? AdminMessages.REVIEW_UNHIDDEN
      : AdminMessages.REVIEW_HIDDEN;

    res.status(httpStatus.OK).json({
      success: true,
      message,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// ================= PAYMENT MANAGEMENT HANDLERS =================

const refundPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paymentId = req.params.id as string;

    const validation = refundPaymentValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const payment = await refundPaymentIntoDB(
      paymentId,
      validation.data
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.PAYMENT_REFUNDED,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string;

    const result = await getAllPaymentsFromDB(page, pageSize, status);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.PAYMENTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ================= BLOG MANAGEMENT HANDLERS =================

const createBlogPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.user?.id;
    
    if (!adminId) {
      throw new AppError("Admin ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = createBlogValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const blogPost = await createBlogPostIntoDB(adminId, validation.data);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: AdminMessages.BLOG_CREATED,
      data: blogPost,
    });
  } catch (error) {
    next(error);
  }
};

const updateBlogPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id as string;

    const validation = updateBlogValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const blogPost = await updateBlogPostIntoDB(postId, validation.data);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.BLOG_UPDATED,
      data: blogPost,
    });
  } catch (error) {
    next(error);
  }
};

const publishBlogPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id as string;

    const validation = publishBlogValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const blogPost = await publishBlogPostIntoDB(
      postId,
      validation.data
    );

    const message = validation.data.isPublished
      ? AdminMessages.BLOG_PUBLISHED
      : AdminMessages.BLOG_UNPUBLISHED;

    res.status(httpStatus.OK).json({
      success: true,
      message,
      data: blogPost,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlogPostHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.id as string;

    await deleteBlogPostFromDB(postId);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.BLOG_DELETED,
      data: { id: postId },
    });
  } catch (error) {
    next(error);
  }
};

const getAllBlogPostsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await getAllBlogPostsFromDB(page, pageSize);

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.BLOG_POSTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ================= ANALYTICS HANDLER =================

const getAnalyticsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const analytics = await getAnalyticsFromDB();

    res.status(httpStatus.OK).json({
      success: true,
      message: AdminMessages.ANALYTICS_FETCHED,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// ================= EXPORTED CONTROLLER OBJECT =================

export const AdminController = {
  // Property Moderation
  getPendingProperties: getPendingPropertiesHandler,
  approveProperty: approvePropertyHandler,
  deleteProperty: deletePropertyHandler,

  // Owner Verification
  verifyOwner: verifyOwnerHandler,
  getUnverifiedOwners: getUnverifiedOwnersHandler,

  // Review Management
  getFlaggedReviews: getFlaggedReviewsHandler,
  hideReview: hideReviewHandler,

  // Payment Management
  refundPayment: refundPaymentHandler,
  getAllPayments: getAllPaymentsHandler,

  // Blog Management
  createBlogPost: createBlogPostHandler,
  updateBlogPost: updateBlogPostHandler,
  publishBlogPost: publishBlogPostHandler,
  deleteBlogPost: deleteBlogPostHandler,
  getAllBlogPosts: getAllBlogPostsHandler,

  // Analytics
  getAnalytics: getAnalyticsHandler,
};