import express from 'express';
import { OwnerController } from './owner.controller';
import { verifyAuth, roleGuard, UserRole } from '../../middlewares/auth';

const router = express.Router();

// ================= OWNER PROFILE ROUTES =================
// Get owner profile
router.get('/profile', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getOwnerProfile);

// Update owner profile
router.patch('/profile', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.updateOwnerProfile);

// ================= PROPERTY ROUTES =================
// Create property
router.post('/properties', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.createProperty);

// Get all owner properties with pagination and filters
router.get('/properties', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getOwnerProperties);

// Get single property
router.get('/properties/:id', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getPropertyById);

// Update property
router.put('/properties/:id', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.updateProperty);

// Delete property
router.delete('/properties/:id', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.deleteProperty);

// ================= BOOKING ROUTES =================
// Get all bookings for owner's properties
router.get('/bookings', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getOwnerBookings);

// Respond to booking (accept/decline)
router.patch('/bookings/:id', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.respondToBooking);

// ================= REVIEW ROUTES =================
// Get reviews for a property
router.get('/properties/:propertyId/reviews', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getPropertyReviews);

// Flag a review
router.patch('/reviews/:id/flag', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.flagReview);

// ================= STATS ROUTES =================
// Get owner statistics
router.get('/stats', verifyAuth, roleGuard([UserRole.OWNER]), OwnerController.getOwnerStats);

export const OwnerRoutes = router;
