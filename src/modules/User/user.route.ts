import express from 'express';
import { UserController } from './user.controller';
import { verifyAuth, roleGuard, UserRole } from '../../middlewares/auth';

const router = express.Router();

// ================= USER PROFILE ROUTES =================
// Get current user profile
router.get('/me', verifyAuth, UserController.getCurrentUser);

// Update current user profile
router.patch('/me', verifyAuth, UserController.updateProfile);

// Change user role
router.patch('/me/role', verifyAuth, UserController.changeRole);

// Get user statistics
router.get('/me/stats', verifyAuth, UserController.getUserStats);

// ================= ADMIN ROUTES =================
// Get all users with pagination and filters
router.get('/', verifyAuth, roleGuard([UserRole.ADMIN]), UserController.getAllUsers);

// Ban/unban a user
router.patch('/:id/ban', verifyAuth, roleGuard([UserRole.ADMIN]), UserController.banUser);

// Delete a user
router.delete('/:id', verifyAuth, roleGuard([UserRole.ADMIN]), UserController.deleteUser);

export const UserRoutes = router;
