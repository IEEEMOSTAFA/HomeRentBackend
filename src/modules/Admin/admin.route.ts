import express from 'express';
import { AdminController } from './admin.controller';
import { verifyAuth, roleGuard, UserRole } from '../../middlewares/auth';

const router = express.Router();

// All admin routes require ADMIN role
router.use(verifyAuth, roleGuard([UserRole.ADMIN]));

// ================= PROPERTY MODERATION =================
// Get pending properties
router.get('/properties/pending', AdminController.getPendingProperties);

// Approve or reject property
router.patch('/properties/:id/status', AdminController.approveProperty);

// Delete property
router.delete('/properties/:id', AdminController.deleteProperty);

// ================= OWNER VERIFICATION =================
// Get unverified owners
router.get('/owners/unverified', AdminController.getUnverifiedOwners);

// Verify owner
router.patch('/owners/:id/verify', AdminController.verifyOwner);

// ================= REVIEW MANAGEMENT =================
// Get flagged reviews
router.get('/reviews/flagged', AdminController.getFlaggedReviews);

// Hide/show review
router.patch('/reviews/:id/visibility', AdminController.hideReview);

// ================= PAYMENT MANAGEMENT =================
// Get all payments
router.get('/payments', AdminController.getAllPayments);

// Refund payment
router.post('/payments/:id/refund', AdminController.refundPayment);

// ================= BLOG MANAGEMENT =================
// Get all blog posts
router.get('/blog', AdminController.getAllBlogPosts);

// Create blog post
router.post('/blog', AdminController.createBlogPost);

// Update blog post
router.patch('/blog/:id', AdminController.updateBlogPost);

// Publish/unpublish blog post
router.patch('/blog/:id/publish', AdminController.publishBlogPost);

// Delete blog post
router.delete('/blog/:id', AdminController.deleteBlogPost);

// ================= ANALYTICS =================
// Get analytics dashboard
router.get('/analytics', AdminController.getAnalytics);

export const AdminRoutes = router;
