import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { AdminErrors, AdminMessages } from "./admin.constant";
import {
  ApprovePropertyInput,
  VerifyOwnerInput,
  HideReviewInput,
  RefundPaymentInput,
  CreateBlogInput,
  UpdateBlogInput,
  PublishBlogInput,
} from "./admin.validation";

// ================= UTILITY FUNCTIONS =================

const calculatePagination = (page: number, pageSize: number) => ({
  skip: (page - 1) * pageSize,
  page,
  pageSize,
});

const buildPaginationResponse = (
  data: any[],
  total: number,
  page: number,
  pageSize: number
) => ({
  data,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
});

// ================= PROPERTY MODERATION SERVICES =================

const getPendingPropertiesFromDB = async (
  page: number = 1,
  pageSize: number = 20,
  search?: string
) => {
  const { skip } = calculatePagination(page, pageSize);
  const where: any = { status: "PENDING" };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { area: { contains: search, mode: "insensitive" } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            ownerProfile: {
              select: { verified: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.property.count({ where }),
  ]);

  return buildPaginationResponse(properties, total, page, pageSize);
};

const approvePropertyIntoDB = async (
  propertyId: string,
  data: ApprovePropertyInput
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(AdminErrors.PROPERTY_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (data.status === "REJECTED" && !data.rejectionReason) {
    throw new AppError(
      AdminErrors.INVALID_REJECTION_REASON,
      httpStatus.BAD_REQUEST
    );
  }

  const updatedProperty = await prisma.property.update({
    where: { id: propertyId },
    data: {
      status: data.status as any,
      rejectionReason: data.rejectionReason || null,
      publishedAt: data.status === "APPROVED" ? new Date() : null,
    },
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  // TODO: Send notification to owner about approval/rejection
  return updatedProperty;
};

const deletePropertyFromDB = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(AdminErrors.PROPERTY_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });

  return { id: propertyId, message: AdminMessages.PROPERTY_DELETED };
};

// ================= OWNER VERIFICATION SERVICES =================

const verifyOwnerIntoDB = async (
  ownerId: string,
  data: VerifyOwnerInput
) => {
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new AppError(AdminErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedProfile = await prisma.ownerProfile.update({
    where: { userId: ownerId },
    data: {
      verified: data.verified,
      verifiedAt: data.verified ? new Date() : null,
    },
  });

  return updatedProfile;
};

const getUnverifiedOwnersFromDB = async (
  page: number = 1,
  pageSize: number = 20
) => {
  const { skip } = calculatePagination(page, pageSize);

  const [owners, total] = await Promise.all([
    prisma.ownerProfile.findMany({
      where: { verified: false },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ownerProfile.count({ where: { verified: false } }),
  ]);

  return buildPaginationResponse(owners, total, page, pageSize);
};

// ================= REVIEW MANAGEMENT SERVICES =================

// const getFlaggedReviewsFromDB = async (
//   page: number = 1,
//   pageSize: number = 20
// ) => {
//   const { skip } = calculatePagination(page, pageSize);

//   const [reviews, total] = await Promise.all([
//     prisma.review.findMany({
//       where: { isFlagged: true },
//       skip,
//       take: pageSize,
//       include: {
//         user: {
//           select: { id: true, name: true, email: true },
//         },
//         property: {
//           select: { id: true, title: true },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     }),
//     prisma.review.count({ where: { isFlagged: true } }),
//   ]);

//   return buildPaginationResponse(reviews, total, page, pageSize);
// };




// ✅ পরে — সব field আছে
const getFlaggedReviewsFromDB = async (page = 1, pageSize = 20) => {
  const { skip } = calculatePagination(page, pageSize);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { isFlagged: true },
      skip,
      take: pageSize,
      include: {
        user: {
          select: { id: true, name: true, image: true }, // ✅ image যোগ হয়েছে
        },
        property: {
          select: { id: true, title: true, city: true, area: true }, // ✅ city, area যোগ হয়েছে
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { isFlagged: true } }),
  ]);

  return buildPaginationResponse(reviews, total, page, pageSize);
};


const hideReviewIntoDB = async (
  reviewId: string,
  data: HideReviewInput
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(AdminErrors.REVIEW_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: { isVisible: data.isVisible },
  });

  return updatedReview;
};

// ================= PAYMENT MANAGEMENT SERVICES =================

const refundPaymentIntoDB = async (
  paymentId: string,
  data: RefundPaymentInput
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(AdminErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (payment.status !== "SUCCESS") {
    throw new AppError(
      AdminErrors.PAYMENT_ALREADY_PROCESSED,
      httpStatus.BAD_REQUEST
    );
  }

  const refundAmount = data.refundAmount || payment.amount;

  if (refundAmount > payment.amount) {
    throw new AppError(
      AdminErrors.INSUFFICIENT_FUNDS,
      httpStatus.BAD_REQUEST
    );
  }

  // TODO: Process Stripe refund via API

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "REFUNDED",
      refundAmount,
      refundedAt: new Date(),
    },
  });

  return updatedPayment;
};

const getAllPaymentsFromDB = async (
  page: number = 1,
  pageSize: number = 20,
  status?: string
) => {
  const { skip } = calculatePagination(page, pageSize);
  const where: any = {};
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        booking: {
          include: {
            property: { select: { title: true } },
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return buildPaginationResponse(payments, total, page, pageSize);
};

// ================= BLOG MANAGEMENT SERVICES =================

const createBlogPostIntoDB = async (
  adminId: string,
  data: CreateBlogInput
) => {
  const blogPost = await prisma.blogPost.create({
    data: {
      ...data,
      authorId: adminId,
    },
  });

  return blogPost;
};

const updateBlogPostIntoDB = async (
  postId: string,
  data: UpdateBlogInput
) => {
  const blogPost = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!blogPost) {
    throw new AppError(AdminErrors.BLOG_POST_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id: postId },
    data,
  });

  return updatedPost;
};

const publishBlogPostIntoDB = async (
  postId: string,
  data: PublishBlogInput
) => {
  const blogPost = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!blogPost) {
    throw new AppError(AdminErrors.BLOG_POST_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id: postId },
    data: {
      isPublished: data.isPublished,
      publishedAt: data.isPublished ? new Date() : null,
    },
  });

  return updatedPost;
};

const deleteBlogPostFromDB = async (postId: string) => {
  const blogPost = await prisma.blogPost.findUnique({
    where: { id: postId },
  });

  if (!blogPost) {
    throw new AppError(AdminErrors.BLOG_POST_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  await prisma.blogPost.delete({
    where: { id: postId },
  });

  return { id: postId, message: AdminMessages.BLOG_DELETED };
};

const getAllBlogPostsFromDB = async (
  page: number = 1,
  pageSize: number = 20
) => {
  const { skip } = calculatePagination(page, pageSize);

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      skip,
      take: pageSize,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blogPost.count(),
  ]);

  return buildPaginationResponse(posts, total, page, pageSize);
};

// ================= ANALYTICS SERVICES =================

// ================= ANALYTICS SERVICES =================

const getAnalyticsFromDB = async () => {
  const [
    totalUsers,
    totalOwners,
    bannedUsers,
    newUsersThisMonth,
    totalProperties,
    approvedProperties,
    pendingProperties,
    rejectedProperties,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalReviews,
    flaggedReviews,
    hiddenReviews,
    verifiedOwners,
    unverifiedOwners,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ownerProfile.count(),
    prisma.user.count({ where: { isBanned: true } }),
    
    // New users this month
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),

    prisma.property.count(),
    prisma.property.count({ where: { status: "APPROVED" } }),
    prisma.property.count({ where: { status: "PENDING" } }),
    prisma.property.count({ where: { status: "REJECTED" } }),

    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),

    prisma.review.count(),
    prisma.review.count({ where: { isFlagged: true } }),
    prisma.review.count({ where: { isVisible: false } }),

    prisma.ownerProfile.count({ where: { verified: true } }),
    prisma.ownerProfile.count({ where: { verified: false } }),
  ]);

  // Revenue calculation
  const revenue = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });

  const revenueThisMonth = await prisma.payment.aggregate({
    where: {
      status: "SUCCESS",
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    _sum: { amount: true },
  });

  const totalRefunds = await prisma.payment.aggregate({
    where: { status: "REFUNDED" },
    _sum: { refundAmount: true },
  });

  return {
    totalUsers,
    totalOwners,
    totalAdmins: 1, // আপাতত 1 রাখলাম, পরে ডাইনামিক করা যাবে
    bannedUsers,
    newUsersThisMonth,
    totalProperties,
    approvedProperties,
    pendingProperties,
    rejectedProperties,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue: revenue._sum?.amount || 0,
    revenueThisMonth: revenueThisMonth._sum?.amount || 0,
    totalRefunds: totalRefunds._sum?.refundAmount || 0,
    totalReviews,
    flaggedReviews,
    hiddenReviews,
    verifiedOwners,
    unverifiedOwners,
  };
};

// ================= EXPORTED SERVICE OBJECT =================

export const AdminService = {
  // Property Moderation
  getPendingProperties: getPendingPropertiesFromDB,
  approveProperty: approvePropertyIntoDB,
  deleteProperty: deletePropertyFromDB,

  // Owner Verification
  verifyOwner: verifyOwnerIntoDB,
  getUnverifiedOwners: getUnverifiedOwnersFromDB,

  // Review Management
  getFlaggedReviews: getFlaggedReviewsFromDB,
  hideReview: hideReviewIntoDB,

  // Payment Management
  refundPayment: refundPaymentIntoDB,
  getAllPayments: getAllPaymentsFromDB,

  // Blog Management
  createBlogPost: createBlogPostIntoDB,
  updateBlogPost: updateBlogPostIntoDB,
  publishBlogPost: publishBlogPostIntoDB,
  deleteBlogPost: deleteBlogPostFromDB,
  getAllBlogPosts: getAllBlogPostsFromDB,

  // Analytics
  getAnalytics: getAnalyticsFromDB,
};