import { prisma } from "../../lib/prisma";
import {
  CreatePropertyInput,
  UpdatePropertyInput,
  RespondToBookingInput,
  FlagReviewInput,
  UpdateOwnerProfileInput,
} from "./owner.validation";
import { OwnerMessages, OwnerErrors } from "./owner.constant";

// ================= OWNER PROFILE SERVICES =================

const getOwnerProfileFromDB = async (userId: string) => {
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!ownerProfile) {
    throw new Error(OwnerErrors.PROFILE_NOT_FOUND);
  }

  return ownerProfile;
};

const updateOwnerProfileIntoDB = async (userId: string, data: UpdateOwnerProfileInput) => {
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId },
  });

  if (!ownerProfile) {
    throw new Error(OwnerErrors.PROFILE_NOT_FOUND);
  }

  return prisma.ownerProfile.update({
    where: { userId },
    data: {
      phone: data.phone || null,
      nidNumber: data.nidNumber || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
};

// ================= PROPERTY SERVICES =================

const createPropertyIntoDB = async (ownerId: string, data: CreatePropertyInput) => {
  const ownerProfile = await prisma.ownerProfile.findUnique({
    where: { userId: ownerId },
  });

  if (!ownerProfile) {
    throw new Error(OwnerErrors.INCOMPLETE_PROFILE);
  }

  return prisma.property.create({
    data: {
      ownerId,
      title: data.title,
      description: data.description,
      type: data.type as any,
      city: data.city,
      area: data.area,
      address: data.address,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      size: data.size,
      rentAmount: data.rentAmount,
      advanceDeposit: data.advanceDeposit || 0,
      bookingFee: data.bookingFee || 0,
      isNegotiable: data.isNegotiable || false,
      availableFrom: new Date(data.availableFrom),
      availableFor: data.availableFor as any,
      images: data.images || [],
      status: "PENDING",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

const getOwnerPropertiesFromDB = async (
  ownerId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string
) => {
  const skip = (page - 1) * pageSize;

  const where: any = { ownerId };
  if (status) {
    where.status = status;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        bookings: { select: { id: true, status: true } },
        reviews: { select: { id: true, rating: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const getPropertyByIdFromDB = async (propertyId: string, ownerId?: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      bookings: { select: { id: true, status: true } },
      reviews: { select: { id: true, rating: true, comment: true } },
    },
  });

  if (!property) {
    throw new Error(OwnerErrors.PROPERTY_NOT_FOUND);
  }

  if (ownerId && property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  return property;
};

const updatePropertyIntoDB = async (
  propertyId: string,
  ownerId: string,
  data: UpdatePropertyInput
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error(OwnerErrors.PROPERTY_NOT_FOUND);
  }

  if (property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      title: data.title,
      description: data.description,
      type: data.type as any,
      city: data.city,
      area: data.area,
      address: data.address,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      size: data.size,
      rentAmount: data.rentAmount,
      advanceDeposit: data.advanceDeposit,
      bookingFee: data.bookingFee,
      isNegotiable: data.isNegotiable,
      availableFrom: data.availableFrom
        ? new Date(data.availableFrom)
        : undefined,
      availableFor: data.availableFor as any,
      images: data.images,
    },
  });
};

const deletePropertyFromDB = async (propertyId: string, ownerId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error(OwnerErrors.PROPERTY_NOT_FOUND);
  }

  if (property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  return prisma.property.delete({
    where: { id: propertyId },
  });
};

// ================= BOOKING SERVICES =================

const getOwnerBookingsFromDB = async (
  ownerId: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string
) => {
  const skip = (page - 1) * pageSize;

  const where: any = {
    property: { ownerId },
  };
  if (status) {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        property: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const respondToBookingIntoDB = async (
  bookingId: string,
  ownerId: string,
  data: RespondToBookingInput
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: true },
  });

  if (!booking) {
    throw new Error(OwnerErrors.BOOKING_NOT_FOUND);
  }

  if (booking.property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  if (booking.status !== "PENDING") {
    throw new Error(OwnerErrors.BOOKING_ALREADY_RESPONDED);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: data.status === "ACCEPTED" ? "ACCEPTED" : "DECLINED",
    },
    include: {
      property: true,
      user: true,
      payment: true,
    },
  });
};

// ================= REVIEW SERVICES =================

const getPropertyReviewsFromDB = async (
  propertyId: string,
  ownerId: string,
  page: number = 1,
  pageSize: number = 10
) => {
  const skip = (page - 1) * pageSize;

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new Error(OwnerErrors.PROPERTY_NOT_FOUND);
  }

  if (property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId },
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.review.count({ where: { propertyId } }),
  ]);

  return {
    data: reviews,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

const flagReviewIntoDB = async (reviewId: string, ownerId: string, data: FlagReviewInput) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { property: true },
  });

  if (!review) {
    throw new Error(OwnerErrors.REVIEW_NOT_FOUND);
  }

  if (review.property.ownerId !== ownerId) {
    throw new Error(OwnerErrors.UNAUTHORIZED_PROPERTY);
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: {
      isFlagged: data.isFlagged,
    },
  });
};

// ================= STATS SERVICES =================

const getOwnerStatsFromDB = async (ownerId: string) => {
  const [properties, bookings, reviews, earnings] = await Promise.all([
    prisma.property.count({ where: { ownerId, status: "APPROVED" } }),
    prisma.booking.count({
      where: {
        property: { ownerId },
        status: "CONFIRMED",
      },
    }),
    prisma.review.count({
      where: {
        property: { ownerId },
      },
    }),
    prisma.payment.aggregate({
      where: {
        user: { id: ownerId },
        status: "SUCCESS",
      },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalProperties: properties,
    totalBookings: bookings,
    totalReviews: reviews,
    totalEarnings: earnings._sum.amount || 0,
  };
};

// ================= EXPORT ALL SERVICES =================

export const OwnerService = {
  getOwnerProfileFromDB,
  updateOwnerProfileIntoDB,
  createPropertyIntoDB,
  getOwnerPropertiesFromDB,
  getPropertyByIdFromDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
  getOwnerBookingsFromDB,
  respondToBookingIntoDB,
  getPropertyReviewsFromDB,
  flagReviewIntoDB,
  getOwnerStatsFromDB,
};