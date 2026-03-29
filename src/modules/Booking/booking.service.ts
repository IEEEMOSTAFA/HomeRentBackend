import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { BookingErrors, BookingMessages, BOOKING_EXPIRY_HOURS } from "./booking.constant";
import {
  CreateBookingInput,
  UpdateBookingStatusInput,
  CancelBookingInput,
} from "./booking.validation";

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

// ================= CREATE BOOKING =================

const createBookingIntoDB = async (
  userId: string,
  data: CreateBookingInput
) => {
  // 1. Validate move-in date is in the future
  const moveInDate = new Date(data.moveInDate);
  if (moveInDate <= new Date()) {
    throw new AppError(BookingErrors.INVALID_DATE, httpStatus.BAD_REQUEST);
  }

  // 2. Check property exists and is APPROVED
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!property) {
    throw new AppError(BookingErrors.PROPERTY_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (property.status !== "APPROVED") {
    throw new AppError(
      BookingErrors.PROPERTY_NOT_APPROVED,
      httpStatus.BAD_REQUEST
    );
  }

  // 3. Prevent owner from booking their own property
  if (property.ownerId === userId) {
    throw new AppError(
      BookingErrors.CANNOT_BOOK_OWN_PROPERTY,
      httpStatus.FORBIDDEN
    );
  }

  // 4. Prevent duplicate active bookings for the same property
  const existingBooking = await prisma.booking.findFirst({
    where: {
      propertyId: data.propertyId,
      userId,
      status: {
        // Only block if there's already an active booking
        in: ["PENDING", "ACCEPTED", "PAYMENT_PENDING", "CONFIRMED"],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(
      BookingErrors.DUPLICATE_BOOKING,
      httpStatus.CONFLICT
    );
  }

  // 5. Snapshot pricing from property at time of booking
  // (immune to future rent changes — mirrors schema comment)
  const rentAmount = property.rentAmount;
  const bookingFee = property.bookingFee;
  const totalAmount = bookingFee; // Only bookingFee is charged upfront via Stripe

  // 6. Set 24-hour expiry window for owner to respond
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + BOOKING_EXPIRY_HOURS);

  // 7. Create the booking
  const booking = await prisma.booking.create({
    data: {
      propertyId: data.propertyId,
      userId,
      moveInDate,
      moveOutDate: data.moveOutDate ? new Date(data.moveOutDate) : null,
      message: data.message || null,
      numberOfTenants: data.numberOfTenants ?? 1,
      rentAmount,
      bookingFee,
      totalAmount,
      status: "PENDING",
      expiresAt,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          city: true,
          area: true,
          rentAmount: true,
          bookingFee: true,
          owner: { select: { id: true, name: true, email: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // 8. Notify the property owner
  await prisma.notification.create({
    data: {
      userId: property.ownerId,
      bookingId: booking.id,
      title: "New Booking Request",
      message: `${booking.user.name} has requested to book "${property.title}". Please review and respond within 24 hours.`,
      type: "booking_update",
      actionUrl: `/dashboard/bookings/${booking.id}`,
    },
  });

  return booking;
};

// ================= GET BOOKINGS (ROLE-BASED) =================

const getBookingsFromDB = async (
  userId: string,
  userRole: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string
) => {
  const { skip } = calculatePagination(page, pageSize);

  const where: any = {};
  if (status) where.status = status;

  // USER sees their own bookings
  // OWNER sees bookings for their properties
  // ADMIN sees all bookings
  if (userRole === "USER") {
    where.userId = userId;
  } else if (userRole === "OWNER") {
    where.property = { ownerId: userId };
  }
  // ADMIN: no filter → sees all

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            area: true,
            images: true,
            rentAmount: true,
          },
        },
        user: { select: { id: true, name: true, email: true, image: true } },
        payment: {
          select: { id: true, status: true, amount: true, receiptUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return buildPaginationResponse(bookings, total, page, pageSize);
};

// ================= GET SINGLE BOOKING =================

const getBookingByIdFromDB = async (bookingId: string, userId: string, userRole: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, image: true } },
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(BookingErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Access control: only the user, property owner, or admin can view
  const isUser = booking.userId === userId;
  const isOwner = booking.property.ownerId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isUser && !isOwner && !isAdmin) {
    throw new AppError(BookingErrors.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  return booking;
};

// ================= UPDATE BOOKING STATUS (OWNER) =================
// Owner can ACCEPT or DECLINE a PENDING booking

const updateBookingStatusIntoDB = async (
  bookingId: string,
  ownerId: string,
  data: UpdateBookingStatusInput
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { ownerId: true, title: true } },
      user: { select: { id: true, name: true } },
    },
  });

  if (!booking) {
    throw new AppError(BookingErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Only the property owner can update status
  if (booking.property.ownerId !== ownerId) {
    throw new AppError(BookingErrors.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  // Can only act on PENDING bookings
  if (booking.status !== "PENDING") {
    throw new AppError(
      BookingErrors.INVALID_STATUS_TRANSITION,
      httpStatus.BAD_REQUEST
    );
  }

  // Check if booking has expired
  if (booking.expiresAt && booking.expiresAt < new Date()) {
    throw new AppError(BookingErrors.BOOKING_EXPIRED, httpStatus.BAD_REQUEST);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: data.status,
      cancellationNote:
        data.status === "DECLINED" ? data.cancellationNote || null : null,
    },
  });

  // Notify the user about the owner's decision
  const notificationTitle =
    data.status === "ACCEPTED" ? "Booking Accepted!" : "Booking Declined";
  const notificationMessage =
    data.status === "ACCEPTED"
      ? `Your booking request for "${booking.property.title}" has been accepted. Please proceed to payment.`
      : `Your booking request for "${booking.property.title}" has been declined.${
          data.cancellationNote ? ` Reason: ${data.cancellationNote}` : ""
        }`;

  await prisma.notification.create({
    data: {
      userId: booking.userId,
      bookingId,
      title: notificationTitle,
      message: notificationMessage,
      type: "booking_update",
      actionUrl: `/dashboard/bookings/${bookingId}`,
    },
  });

  return updatedBooking;
};

// ================= CANCEL BOOKING (USER) =================
// User can cancel PENDING or ACCEPTED bookings (before payment)

const cancelBookingIntoDB = async (
  bookingId: string,
  userId: string,
  data: CancelBookingInput
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { ownerId: true, title: true } },
    },
  });

  if (!booking) {
    throw new AppError(BookingErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Only the booking owner can cancel
  if (booking.userId !== userId) {
    throw new AppError(BookingErrors.UNAUTHORIZED, httpStatus.FORBIDDEN);
  }

  // Can only cancel PENDING or ACCEPTED bookings (not after payment)
  const cancellableStatuses = ["PENDING", "ACCEPTED"];
  if (!cancellableStatuses.includes(booking.status)) {
    throw new AppError(BookingErrors.CANNOT_CANCEL, httpStatus.BAD_REQUEST);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancellationNote: data.cancellationNote || null,
      cancelledAt: new Date(),
    },
  });

  // Notify property owner about the cancellation
  await prisma.notification.create({
    data: {
      userId: booking.property.ownerId,
      bookingId,
      title: "Booking Cancelled",
      message: `A booking request for "${booking.property.title}" has been cancelled by the tenant.`,
      type: "booking_update",
      actionUrl: `/dashboard/bookings/${bookingId}`,
    },
  });

  return updatedBooking;
};

// ================= EXPORTED SERVICE OBJECT =================

export const BookingService = {
  createBooking: createBookingIntoDB,
  getBookings: getBookingsFromDB,
  getBookingById: getBookingByIdFromDB,
  updateBookingStatus: updateBookingStatusIntoDB,
  cancelBooking: cancelBookingIntoDB,
};