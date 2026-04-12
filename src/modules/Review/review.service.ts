
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { ReviewErrors } from "./review.constant";
import { CreateReviewInput } from "./review.validation";
import {
  IBookingForReview,
  IDeleteReviewResult,
  IGetAllReviewsParams,
  IGetReviewsParams,
  IPaginatedResult,
  IReviewCreated,
  IReviewWithAdminDetails,
  IReviewWithProperty,
  IReviewWithUser,
} from "./review.interface";

// ================= CREATE REVIEW =================

const createReviewIntoDB = async (
  userId: string,
  data: CreateReviewInput
): Promise<IReviewCreated> => {
  const booking = (await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      property: { select: { id: true, ownerId: true } },
      review: true,
    },
  })) as IBookingForReview | null;

  if (!booking) {
    throw new AppError(ReviewErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (booking.userId !== userId) {
    throw new AppError(ReviewErrors.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  if (booking.status !== "CONFIRMED") {
    throw new AppError(
      ReviewErrors.NOT_CONFIRMED_BOOKING,
      httpStatus.BAD_REQUEST
    );
  }

  if (booking.review) {
    throw new AppError(ReviewErrors.ALREADY_REVIEWED, httpStatus.CONFLICT);
  }

  const review = (await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      propertyId: booking.propertyId,
      userId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      property: { select: { id: true, title: true } },
    },
  })) as unknown as IReviewCreated;

  const propertyStats = await prisma.review.aggregate({
    where: { propertyId: booking.propertyId, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.property.update({
    where: { id: booking.propertyId },
    data: {
      rating: propertyStats._avg.rating ?? 0,
      totalReviews: propertyStats._count.rating,
    },
  });

  const ownerStats = await prisma.review.aggregate({
    where: {
      property: { ownerId: booking.property.ownerId },
      isVisible: true,
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.ownerProfile.updateMany({
    where: { userId: booking.property.ownerId },
    data: {
      rating: ownerStats._avg.rating ?? 0,
      totalReviews: ownerStats._count.rating,
    },
  });

  return review;
};

// ================= GET REVIEWS FOR A PROPERTY =================
const getPropertyReviewsFromDB = async (
  propertyId: string,
  { page = 1, pageSize = 10 }: IGetReviewsParams = {}
): Promise<IPaginatedResult<IReviewWithUser>> => {
  const skip = (page - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId, isVisible: true },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.review.count({ where: { propertyId, isVisible: true } }),
  ]);

  return {
    data: reviews as unknown as IReviewWithUser[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// ================= GET MY REVIEWS (as USER) =================
const getMyReviewsFromDB = async (
  userId: string,
  { page = 1, pageSize = 10 }: IGetReviewsParams = {}
): Promise<IPaginatedResult<IReviewWithProperty>> => {
  const skip = (page - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            area: true,
            images: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    data: reviews as unknown as IReviewWithProperty[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// ================= FLAG A REVIEW (OWNER) =================
/**
 * ✅ FIXED: isFlagged toggle support যোগ করা হয়েছে
 *
 * IMPORTANT — Postman test এর জন্য:
 *   এই endpoint এ OWNER token লাগবে, ADMIN token কাজ করবে না।
 *   PATCH /api/reviews/:id/flag
 *   Authorization: Bearer <OWNER_TOKEN>
 *   Body: {} (body লাগবে না)
 */
const flagReviewIntoDB = async (
  reviewId: string,
  ownerId: string
): Promise<IReviewWithUser> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { property: { select: { ownerId: true } } },
  });

  if (!review) {
    throw new AppError(ReviewErrors.REVIEW_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // ✅ Owner নিজের property র review-ই শুধু flag করতে পারবে
  if (review.property.ownerId !== ownerId) {
    throw new AppError(ReviewErrors.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  // ✅ Toggle: already flagged হলে unflag, না হলে flag
  const newFlagState = !review.isFlagged;

  return prisma.review.update({
    where: { id: reviewId },
    data: { isFlagged: newFlagState },
  }) as unknown as IReviewWithUser;
};

// ================= ADMIN: GET ALL REVIEWS =================
const getAllReviewsFromDB = async ({
  page = 1,
  pageSize = 10,
  isFlagged,
}: IGetAllReviewsParams = {}): Promise<
  IPaginatedResult<IReviewWithAdminDetails>
> => {
  const skip = (page - 1) * pageSize;

  const where: { isFlagged?: boolean } = {};
  if (isFlagged !== undefined) where.isFlagged = isFlagged;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        property: { select: { id: true, title: true, city: true, area: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews as unknown as IReviewWithAdminDetails[],
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

// ================= ADMIN: TOGGLE VISIBILITY =================

const toggleReviewVisibilityIntoDB = async (
  reviewId: string,
  isVisible: boolean
): Promise<IReviewWithUser> => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new AppError(ReviewErrors.REVIEW_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // ✅ FIXED: isFlagged: false সরানো হয়েছে — flag থাকবে
  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { isVisible }, // ← আগে ছিল { isVisible, isFlagged: false }
  });

  // Property rating recalculate
  const propertyStats = await prisma.review.aggregate({
    where: { propertyId: review.propertyId, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.property.update({
    where: { id: review.propertyId },
    data: {
      rating: propertyStats._avg.rating ?? 0,
      totalReviews: propertyStats._count.rating,
    },
  });

  // OwnerProfile rating recalculate
  const propertyWithOwner = await prisma.property.findUnique({
    where: { id: review.propertyId },
    select: { ownerId: true },
  });

  if (propertyWithOwner) {
    const ownerStats = await prisma.review.aggregate({
      where: {
        property: { ownerId: propertyWithOwner.ownerId },
        isVisible: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.ownerProfile.updateMany({
      where: { userId: propertyWithOwner.ownerId },
      data: {
        rating: ownerStats._avg.rating ?? 0,
        totalReviews: ownerStats._count.rating,
      },
    });
  }

  return updated as unknown as IReviewWithUser;
};

// ================= ADMIN: DELETE REVIEW =================
const deleteReviewFromDB = async (
  reviewId: string
): Promise<IDeleteReviewResult> => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) {
    throw new AppError(ReviewErrors.REVIEW_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const propertyWithOwner = await prisma.property.findUnique({
    where: { id: review.propertyId },
    select: { ownerId: true },
  });

  await prisma.review.delete({ where: { id: reviewId } });

  // Property rating recalculate
  const propertyStats = await prisma.review.aggregate({
    where: { propertyId: review.propertyId, isVisible: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.property.update({
    where: { id: review.propertyId },
    data: {
      rating: propertyStats._avg.rating ?? 0,
      totalReviews: propertyStats._count.rating,
    },
  });

  // OwnerProfile rating recalculate
  if (propertyWithOwner) {
    const ownerStats = await prisma.review.aggregate({
      where: {
        property: { ownerId: propertyWithOwner.ownerId },
        isVisible: true,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.ownerProfile.updateMany({
      where: { userId: propertyWithOwner.ownerId },
      data: {
        rating: ownerStats._avg.rating ?? 0,
        totalReviews: ownerStats._count.rating,
      },
    });
  }

  return { id: reviewId, message: "Review deleted successfully" };
};

// ================= REVIEW SERVICE =================
export const ReviewService = {
  createReview: createReviewIntoDB,
  getPropertyReviews: getPropertyReviewsFromDB,
  getMyReviews: getMyReviewsFromDB,
  flagReview: flagReviewIntoDB,
  getAllReviews: getAllReviewsFromDB,
  toggleReviewVisibility: toggleReviewVisibilityIntoDB,
  deleteReview: deleteReviewFromDB,
};