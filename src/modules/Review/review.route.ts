import express from "express";
import { ReviewController } from "./review.controller";
import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

const router = express.Router();

// ================= USER ROUTES =================

// POST /api/reviews
// Submit a review (must be logged in USER with a CONFIRMED booking)
router.post("/", verifyAuth, ReviewController.createReview);

// GET /api/reviews/my
// Get my own reviews
router.get("/my", verifyAuth, ReviewController.getMyReviews);

// ================= PUBLIC ROUTES =================

// GET /api/reviews/property/:propertyId
// Get all visible reviews for a property (public)
router.get("/property/:propertyId", ReviewController.getPropertyReviews);

// ================= OWNER ROUTES =================

// PATCH /api/reviews/:id/flag
// Flag a suspicious review on owner's property
router.patch(
  "/:id/flag",
  verifyAuth,
  roleGuard([UserRole.OWNER]),
  ReviewController.flagReview
);

// ================= ADMIN ROUTES =================

// GET /api/reviews
// Get all reviews with optional ?isFlagged=true filter
router.get(
  "/",
  verifyAuth,
  roleGuard([UserRole.ADMIN]),
  ReviewController.getAllReviews
);

// PATCH /api/reviews/:id/hide        ← PRD spec (primary)
// PATCH /api/reviews/:id/visibility  ← alias kept for backward compatibility
// Show or hide a review (Admin only)
router.patch(
  "/:id/hide",
  verifyAuth,
  roleGuard([UserRole.ADMIN]),
  ReviewController.toggleVisibility
);

// ✅ Kept as alias so existing clients using /visibility don't break
router.patch(
  "/:id/visibility",
  verifyAuth,
  roleGuard([UserRole.ADMIN]),
  ReviewController.toggleVisibility
);

// DELETE /api/reviews/:id
// Hard delete a review
router.delete(
  "/:id",
  verifyAuth,
  roleGuard([UserRole.ADMIN]),
  ReviewController.deleteReview
);

export const ReviewRoutes = router;

































// import express from "express";
// import { ReviewController } from "./review.controller";
// import { verifyAuth, roleGuard, UserRole } from "../../middlewares/auth";

// const router = express.Router();

// // ================= USER ROUTES =================

// // POST /api/reviews
// // Submit a review (must be logged in USER with a CONFIRMED booking)
// router.post("/", verifyAuth, ReviewController.createReview);

// // GET /api/reviews/my
// // Get my own reviews
// router.get("/my", verifyAuth, ReviewController.getMyReviews);

// // ================= PUBLIC ROUTES =================

// // GET /api/reviews/property/:propertyId
// // Get all visible reviews for a property (public)
// router.get("/property/:propertyId", ReviewController.getPropertyReviews);

// // ================= OWNER ROUTES =================

// // PATCH /api/reviews/:id/flag
// // Flag a suspicious review on owner's property
// router.patch(
//   "/:id/flag",
//   verifyAuth,
//   roleGuard([UserRole.OWNER]),
//   ReviewController.flagReview
// );

// // ================= ADMIN ROUTES =================

// // GET /api/reviews
// // Get all reviews with optional ?isFlagged=true filter
// router.get(
//   "/",
//   verifyAuth,
//   roleGuard([UserRole.ADMIN]),
//   ReviewController.getAllReviews
// );

// // PATCH /api/reviews/:id/visibility
// // Show or hide a review
// router.patch(
//   "/:id/visibility",
//   verifyAuth,
//   roleGuard([UserRole.ADMIN]),
//   ReviewController.toggleVisibility
// );

// // DELETE /api/reviews/:id
// // Hard delete a review
// router.delete(
//   "/:id",
//   verifyAuth,
//   roleGuard([UserRole.ADMIN]),
//   ReviewController.deleteReview
// );

// export const ReviewRoutes = router;