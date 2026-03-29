import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { BookingService } from "./booking.service";
import { BookingMessages } from "./booking.constant";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
} from "./booking.validation";

const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: any
) => {
  res.status(statusCode).json({ statusCode, success, message, data });
};

// ================= BOOKING CONTROLLERS =================

/**
 * POST /api/bookings
 * Role: USER
 * Creates a new booking request with PENDING status
 */
const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const validated = createBookingSchema.parse(req.body);

    const booking = await BookingService.createBooking(userId, validated);

    sendResponse(
      res,
      httpStatus.CREATED,
      true,
      BookingMessages.BOOKING_CREATED,
      booking
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings
 * Role: USER (own bookings) | OWNER (their property bookings) | ADMIN (all)
 * Query: ?page=1&pageSize=10&status=PENDING
 */
const getBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const status = req.query.status as string | undefined;

    const result = await BookingService.getBookings(
      userId,
      userRole,
      page,
      pageSize,
      status
    );

    sendResponse(res, httpStatus.OK, true, BookingMessages.BOOKING_FETCHED, result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 * Role: USER (own) | OWNER (their property) | ADMIN
 */
const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;

    const booking = await BookingService.getBookingById(id as string, userId, userRole);

    sendResponse(
      res,
      httpStatus.OK,
      true,
      BookingMessages.BOOKING_DETAIL_FETCHED,
      booking
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Role: OWNER
 * Owner accepts (ACCEPTED) or declines (DECLINED) a PENDING booking
 */
const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user!.id;
    const { id } = req.params;
    const validated = updateBookingStatusSchema.parse(req.body);

    const booking = await BookingService.updateBookingStatus(
      id as string  ,
      ownerId,
      validated
    );

    sendResponse(
      res,
      httpStatus.OK,
      true,
      BookingMessages.BOOKING_UPDATED,
      booking
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Role: USER
 * User cancels their own PENDING or ACCEPTED booking (before payment)
 */
// const cancelBooking = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user!.id;
//     const { id } = req.params;
//     const validated = cancelBookingSchema.parse(req.body);

//     const booking = await BookingService.cancelBooking(id as string, userId, validated);

//     sendResponse(
//       res,
//       httpStatus.OK,
//       true,
//       BookingMessages.BOOKING_CANCELLED,
//       booking
//     );
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * PATCH /api/bookings/:id/cancel
 * Role: USER
 * User cancels their own booking — only allowed when status is PENDING or ACCEPTED
 * (i.e. before payment is initiated)
 *
 * Body (optional):
 * {
 *   "cancellationNote": "Changed my plans"
 * }
 *
 * Flow:
 *   PENDING  → CANCELLED ✅
 *   ACCEPTED → CANCELLED ✅
 *   PAYMENT_PENDING / CONFIRMED / DECLINED → ❌ 400 CANNOT_CANCEL
 */
const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const validated = cancelBookingSchema.parse(req.body);

    const booking = await BookingService.cancelBooking(id as string, userId, validated);

    sendResponse(
      res,
      httpStatus.OK,
      true,
      BookingMessages.BOOKING_CANCELLED,
      booking
    );
  } catch (error) {
    next(error);
  }
};

export const BookingController = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,       // ← PATCH /api/bookings/:id/cancel
};




























// import { Request, Response, NextFunction } from "express";
// import httpStatus from "http-status";
// import { BookingService } from "./booking.service";
// import { BookingMessages } from "./booking.constant";
// import {
//   createBookingSchema,
//   updateBookingStatusSchema,
//   cancelBookingSchema,
// } from "./booking.validation";

// const sendResponse = (
//   res: Response,
//   statusCode: number,
//   success: boolean,
//   message: string,
//   data?: any
// ) => {
//   res.status(statusCode).json({ statusCode, success, message, data });
// };

// // ================= BOOKING CONTROLLERS =================

// /**
//  * POST /api/bookings
//  * Role: USER
//  * Creates a new booking request with PENDING status
//  */
// const createBooking = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user!.id;
//     const validated = createBookingSchema.parse(req.body);

//     const booking = await BookingService.createBooking(userId, validated);

//     sendResponse(
//       res,
//       httpStatus.CREATED,
//       true,
//       BookingMessages.BOOKING_CREATED,
//       booking
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * GET /api/bookings
//  * Role: USER (own bookings) | OWNER (their property bookings) | ADMIN (all)
//  * Query: ?page=1&pageSize=10&status=PENDING
//  */
// const getBookings = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user!.id;
//     const userRole = req.user!.role;
//     const page = parseInt(req.query.page as string) || 1;
//     const pageSize = parseInt(req.query.pageSize as string) || 10;
//     const status = req.query.status as string | undefined;

//     const result = await BookingService.getBookings(
//       userId,
//       userRole,
//       page,
//       pageSize,
//       status
//     );

//     sendResponse(res, httpStatus.OK, true, BookingMessages.BOOKING_FETCHED, result);
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * GET /api/bookings/:id
//  * Role: USER (own) | OWNER (their property) | ADMIN
//  */
// const getBookingById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user!.id;
//     const userRole = req.user!.role;
//     const { id } = req.params;

//     const booking = await BookingService.getBookingById(id as string, userId, userRole);

//     sendResponse(
//       res,
//       httpStatus.OK,
//       true,
//       BookingMessages.BOOKING_DETAIL_FETCHED,
//       booking
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * PATCH /api/bookings/:id/status
//  * Role: OWNER
//  * Owner accepts (ACCEPTED) or declines (DECLINED) a PENDING booking
//  */
// const updateBookingStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const ownerId = req.user!.id;
//     const { id } = req.params;
//     const validated = updateBookingStatusSchema.parse(req.body);

//     const booking = await BookingService.updateBookingStatus(
//       id as string,
//       ownerId,
//       validated
//     );

//     sendResponse(
//       res,
//       httpStatus.OK,
//       true,
//       BookingMessages.BOOKING_UPDATED,
//       booking
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// /**
//  * PATCH /api/bookings/:id/cancel
//  * Role: USER
//  * User cancels their own PENDING or ACCEPTED booking (before payment)
//  */
// const cancelBooking = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user!.id;
//     const { id } = req.params;
//     const validated = cancelBookingSchema.parse(req.body);

//     const booking = await BookingService.cancelBooking(id as string, userId, validated);

//     sendResponse(
//       res,
//       httpStatus.OK,
//       true,
//       BookingMessages.BOOKING_CANCELLED,
//       booking
//     );
//   } catch (error) {
//     next(error);
//   }
// };

// export const BookingController = {
//   createBooking,
//   getBookings,
//   getBookingById,
//   updateBookingStatus,
//   cancelBooking,
// };