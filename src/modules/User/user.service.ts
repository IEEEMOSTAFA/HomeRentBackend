import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { UserErrors, UserMessages } from "./user.constant";
import { UpdateProfileInput, UpdateRoleInput } from "./user.validation";

// ================= UTILITY FUNCTIONS =================

/**
 * Get current user profile
 */
const getCurrentUserFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
      ownerProfile: {
        select: {
          id: true,
          verified: true,
          phone: true,
          totalProperties: true,
          totalEarnings: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  return user;
};

/**
 * Update user profile
 */
const updateProfileIntoDB = async (
  userId: string,
  data: UpdateProfileInput
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name || undefined,
      image: data.image || undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      emailVerified: true,
      isActive: true,
      isBanned: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

/**
 * Change user role from USER to OWNER (or vice versa)
 * Auto-creates OwnerProfile when changing to OWNER
 */
const changeRoleIntoDB = async (userId: string, data: UpdateRoleInput) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // If changing to OWNER and profile doesn't exist, create it
  if (data.role === "OWNER") {
    const existingProfile = await prisma.ownerProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      await prisma.ownerProfile.create({
        data: {
          userId,
        },
      });
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: data.role as any,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
    },
  });

  return updatedUser;
};

/**
 * Get all users with pagination and filters
 */
const getAllUsersFromDB = async (
  page: number = 1,
  pageSize: number = 10,
  role?: string,
  search?: string
) => {
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isBanned: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * Ban or unban a user
 */
const banUserIntoDB = async (userId: string, isBanned: boolean) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
    },
  });

  return updatedUser;
};

/**
 * Delete a user (cascades to all related data)
 */
const deleteUserFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Cascade delete handled by Prisma at DB level
  await prisma.user.delete({
    where: { id: userId },
  });

  return { id: userId, message: UserMessages.USER_DELETED };
};

/**
 * Get user statistics (dashboard data)
 */
const getUserStatsFromDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(UserErrors.USER_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  if (user.role === "OWNER") {
    const ownerStats = await prisma.ownerProfile.findUnique({
      where: { userId },
      select: {
        totalProperties: true,
        totalEarnings: true,
        rating: true,
        totalReviews: true,
      },
    });

    const totalBookings = await prisma.booking.count({
      where: {
        property: { ownerId: userId },
      },
    });

    return {
      role: "OWNER",
      ...ownerStats,
      totalBookings,
    };
  } else if (user.role === "USER") {
    const [totalBookings, confirmedBookings, totalSpent] = await Promise.all([
      prisma.booking.count({
        where: { userId },
      }),
      prisma.booking.count({
        where: { userId, status: "CONFIRMED" },
      }),
      prisma.payment.aggregate({
        where: { userId, status: "SUCCESS" },
        _sum: { amount: true },
      }),
    ]);

    return {
      role: "USER",
      totalBookings,
      confirmedBookings,
      totalSpent: totalSpent._sum?.amount || 0,
    };
  }

  return { role: user.role };
};

// ================= USER SERVICE =================
export const UserService = {
  getCurrentUser: getCurrentUserFromDB,
  updateProfile: updateProfileIntoDB,
  changeRole: changeRoleIntoDB,
  getAllUsers: getAllUsersFromDB,
  banUser: banUserIntoDB,
  deleteUser: deleteUserFromDB,
  getUserStats: getUserStatsFromDB,
};