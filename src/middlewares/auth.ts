import { Request, Response, NextFunction } from "express";
import { auth as betterAuth } from "../lib/auth";

// ================= ROLE ENUM (Mirrors schema.prisma UserRole) =================
export enum UserRole {
  ADMIN = "ADMIN",
  OWNER = "OWNER",
  USER = "USER",
}

// ================= AUTHENTICATED USER TYPE =================
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
}

// ================= REQUEST TYPE EXTEND =================
declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser | undefined;
    }
  }
}

// ================= AUTH MIDDLEWARE =================
/**
 * Verify auth middleware - verifies session exists and user is active
 * Usage: verifyAuth to check if user is authenticated
 */
export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    // Check if session exists
    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No active session",
      });
    }

    // Check if email is verified
    if (!session.user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email verification required",
      });
    }

    // Check if account is banned
    if (session.user.isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned",
      });
    }

    // Check if account is active
    if (!session.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // Attach user to request
    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image || null,
      role: session.user.role as UserRole,
      emailVerified: session.user.emailVerified,
      isActive: session.user.isActive || false,
      isBanned: session.user.isBanned || false,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ================= ROLE GUARD MIDDLEWARE =================
/**
 * Role-based access guard middleware
 * Usage: roleGuard(['ADMIN']) for admin only
 *        roleGuard(['OWNER', 'ADMIN']) for multiple roles
 */
export const roleGuard = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - User not found",
        });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for this action",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ================= AUTH MIDDLEWARE (Legacy) =================
/**
 * Role-based auth middleware
 * Usage: auth() for any authenticated user
 *        auth(UserRole.ADMIN) for admin only
 *        auth(UserRole.OWNER, UserRole.USER) for multiple roles
 * 
 * DEPRECATED: Use verifyAuth + roleGuard instead for new code
 */
const auth =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await betterAuth.api.getSession({
        headers: req.headers as any,
      });

      // Check if session exists
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - No active session",
        });
      }

      // Check if email is verified
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Email verification required",
        });
      }

      // Check if account is banned
      if (session.user.isBanned) {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned",
        });
      }

      // Check if account is active
      if (!session.user.isActive) {
        return res.status(403).json({
          success: false,
          message: "Your account is inactive",
        });
      }

      // Attach user to request
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image || null,
        role: session.user.role as UserRole,
        emailVerified: session.user.emailVerified,
        isActive: session.user.isActive || false,
        isBanned: session.user.isBanned || false,
      };

      // Check role-based access
      if (roles.length && req.user && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for this action",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;










