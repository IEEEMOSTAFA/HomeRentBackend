import { Request, Response } from "express";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";
import { ReviewMessages } from "./review.constant";
import { createReviewSchema } from "./review.validation";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errors/AppError";

// POST /api/reviews
// USER: Submit a review for a confirmed booking
const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const parsed = createReviewSchema.parse(req.body);
  const review = await ReviewService.createReview(userId, parsed);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: ReviewMessages.REVIEW_CREATED,
    data: review,
  });
});

// GET /api/reviews/property/:propertyId
// PUBLIC: Get all visible reviews for a property
const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
  const { propertyId } = req.params;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const result = await ReviewService.getPropertyReviews(propertyId as string, {
    page,
    pageSize,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_FETCHED,
    data: result,
  });
});

// GET /api/reviews/my
// USER: Get my own reviews
const getMyReviews = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const result = await ReviewService.getMyReviews(userId, { page, pageSize });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_FETCHED,
    data: result,
  });
});

// PATCH /api/reviews/:id/flag
// OWNER: Flag a review on their property
const flagReview = catchAsync(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const review = await ReviewService.flagReview(req.params.id as string, ownerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_FLAGGED,
    data: review,
  });
});

// GET /api/reviews
// ADMIN: Get all reviews with optional filters
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const isFlagged =
    req.query.isFlagged !== undefined
      ? req.query.isFlagged === "true"
      : undefined;

  const result = await ReviewService.getAllReviews({ page, pageSize, isFlagged });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_FETCHED,
    data: result,
  });
});

// PATCH /api/reviews/:id/hide  (also aliased at /:id/visibility)
// ADMIN: Show or hide a review
const toggleVisibility = catchAsync(async (req: Request, res: Response) => {
  const { isVisible } = req.body;

  // ✅ Fix: validate isVisible is explicitly a boolean — prevent silent no-op
  if (typeof isVisible !== "boolean") {
    throw new AppError(
      "isVisible must be a boolean (true or false)",
      httpStatus.BAD_REQUEST
    );
  }

  const review = await ReviewService.toggleReviewVisibility(
    req.params.id as string,
    isVisible
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_VISIBILITY_UPDATED,
    data: review,
  });
});

// DELETE /api/reviews/:id
// ADMIN: Hard delete a review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.deleteReview(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: ReviewMessages.REVIEW_DELETED,
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getPropertyReviews,
  getMyReviews,
  flagReview,
  getAllReviews,
  toggleVisibility,
  deleteReview,
};
























// import { Request, Response } from "express";
// import httpStatus from "http-status";
// import { ReviewService } from "./review.service";
// import { ReviewMessages } from "./review.constant";
// import { createReviewSchema } from "./review.validation";
// import catchAsync from "../../shared/catchAsync";           // ✅ default import
// import sendResponse from "../../shared/sendResponse";       // ✅ default import

// // POST /api/reviews
// // USER: Submit a review for a confirmed booking
// const createReview = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user!.id;
//   const parsed = createReviewSchema.parse(req.body);
//   const review = await ReviewService.createReview(userId, parsed);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: ReviewMessages.REVIEW_CREATED,
//     data: review,
//   });
// });

// // GET /api/reviews/property/:propertyId
// // PUBLIC: Get all visible reviews for a property
// const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
//   const { propertyId } = req.params;
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;

//   const result = await ReviewService.getPropertyReviews(propertyId as string, {
//     page,
//     pageSize,
//   });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // GET /api/reviews/my
// // USER: Get my own reviews
// const getMyReviews = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user!.id;
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;

//   const result = await ReviewService.getMyReviews(userId, { page, pageSize });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // PATCH /api/reviews/:id/flag
// // OWNER: Flag a review on their property
// const flagReview = catchAsync(async (req: Request, res: Response) => {
//   const ownerId = req.user!.id;
//   const review = await ReviewService.flagReview(req.params.id as string, ownerId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FLAGGED,
//     data: review,
//   });
// });

// // GET /api/reviews
// // ADMIN: Get all reviews with optional filters
// const getAllReviews = catchAsync(async (req: Request, res: Response) => {
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;
//   const isFlagged =
//     req.query.isFlagged !== undefined
//       ? req.query.isFlagged === "true"
//       : undefined;

//   const result = await ReviewService.getAllReviews({ page, pageSize, isFlagged });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // PATCH /api/reviews/:id/visibility
// // ADMIN: Show or hide a review
// const toggleVisibility = catchAsync(async (req: Request, res: Response) => {
//   const { isVisible } = req.body;
//   const review = await ReviewService.toggleReviewVisibility(
//     req.params.id as string,
//     isVisible
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_VISIBILITY_UPDATED,
//     data: review,
//   });
// });

// // DELETE /api/reviews/:id
// // ADMIN: Hard delete a review
// const deleteReview = catchAsync(async (req: Request, res: Response) => {
//   const result = await ReviewService.deleteReview(req.params.id as string);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_DELETED,
//     data: result,
//   });
// });

// export const ReviewController = {
//   createReview,
//   getPropertyReviews,
//   getMyReviews,
//   flagReview,
//   getAllReviews,
//   toggleVisibility,
//   deleteReview,
// };




























// import httpStatus from "http-status";
// import { ReviewService } from "./review.service";
// import { ReviewMessages } from "./review.constant";
// import { createReviewSchema } from "./review.validation";
// import { catchAsync, sendResponse } from "../../shared";

// // POST /api/reviews
// // USER: Submit a review for a confirmed booking
// const createReview = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user!.id;
//   const parsed = createReviewSchema.parse(req.body);
//   const review = await ReviewService.createReview(userId, parsed);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: ReviewMessages.REVIEW_CREATED,
//     data: review,
//   });
// });

// // GET /api/reviews/property/:propertyId
// // PUBLIC: Get all visible reviews for a property
// const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
//   const { propertyId } = req.params;
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;

//   // ✅ Fixed: service expects (propertyId, { page, pageSize }) not positional args
//   const result = await ReviewService.getPropertyReviews(propertyId as string, {
//     page,
//     pageSize,
//   });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // GET /api/reviews/my
// // USER: Get my own reviews
// const getMyReviews = catchAsync(async (req: Request, res: Response) => {
//   const userId = req.user!.id;
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;

//   // ✅ Fixed: service expects (userId, { page, pageSize }) not positional args
//   const result = await ReviewService.getMyReviews(userId, { page, pageSize });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // PATCH /api/reviews/:id/flag
// // OWNER: Flag a review on their property
// const flagReview = catchAsync(async (req: Request, res: Response) => {
//   const ownerId = req.user!.id;
//   const review = await ReviewService.flagReview(req.params.id as string, ownerId);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FLAGGED,
//     data: review,
//   });
// });

// // GET /api/reviews
// // ADMIN: Get all reviews with optional filters
// const getAllReviews = catchAsync(async (req: Request, res: Response) => {
//   const page = Number(req.query.page) || 1;
//   const pageSize = Number(req.query.pageSize) || 10;
//   const isFlagged =
//     req.query.isFlagged !== undefined
//       ? req.query.isFlagged === "true"
//       : undefined;

//   // ✅ Fixed: service expects a single IGetAllReviewsParams object
//   const result = await ReviewService.getAllReviews({ page, pageSize, isFlagged });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_FETCHED,
//     data: result,
//   });
// });

// // PATCH /api/reviews/:id/visibility
// // ADMIN: Show or hide a review
// const toggleVisibility = catchAsync(async (req: Request, res: Response) => {
//   const { isVisible } = req.body;
//   const review = await ReviewService.toggleReviewVisibility(
//     req.params.id as string,
//     isVisible
//   );

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_VISIBILITY_UPDATED,
//     data: review,
//   });
// });

// // DELETE /api/reviews/:id
// // ADMIN: Hard delete a review
// const deleteReview = catchAsync(async (req: Request, res: Response) => {
//   const result = await ReviewService.deleteReview(req.params.id as string);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: ReviewMessages.REVIEW_DELETED,
//     data: result,
//   });
// });

// export const ReviewController = {
//   createReview,
//   getPropertyReviews,
//   getMyReviews,
//   flagReview,
//   getAllReviews,
//   toggleVisibility,
//   deleteReview,
// };