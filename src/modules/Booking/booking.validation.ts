import { z } from "zod";

// POST /api/bookings — User creates a booking request
export const createBookingSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  moveInDate: z.string().datetime("Invalid move-in date"),
  moveOutDate: z.string().datetime("Invalid move-out date").optional(),
  message: z.string().max(500).optional(),
  numberOfTenants: z.number().int().min(1).max(20).default(1),
});

// PATCH /api/bookings/:id/status — Owner accepts or declines
export const updateBookingStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "DECLINED"], {
    error: "Status must be ACCEPTED or DECLINED",
  }),
  cancellationNote: z.string().max(300).optional(),
});

// PATCH /api/bookings/:id/cancel — User cancels before payment
export const cancelBookingSchema = z.object({
  cancellationNote: z.string().max(300).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;