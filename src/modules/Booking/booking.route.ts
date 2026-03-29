import express from "express";
import { BookingController } from "./booking.controller";
import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

const router = express.Router();

// All booking routes require authentication
router.use(verifyAuth);

// ================= USER ROUTES =================

// Submit a new booking request
router.post("/", roleGuard([UserRole.USER]), BookingController.createBooking);

// Cancel own booking (only PENDING or ACCEPTED — before payment)
router.patch(
  "/:id/cancel",
  roleGuard([UserRole.USER]),
  BookingController.cancelBooking
);

// ================= OWNER ROUTES =================

// Accept or decline a booking request
router.patch(
  "/:id/status",
  roleGuard([UserRole.OWNER]),
  BookingController.updateBookingStatus
);

// ================= SHARED ROUTES (USER + OWNER + ADMIN) =================

// Get all bookings — filtered by role automatically in service
router.get("/", BookingController.getBookings);

// Get single booking detail
router.get("/:id", BookingController.getBookingById);

export const BookingRoutes = router;