// Import UserRole from the appropriate file
import { UserRole } from "../middlewares/auth";

// Extend the User type to include the 'otp' property
export interface User {
  name: string;
  id: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: UserRole;
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
  otp?: string; // Add the optional 'otp' property
}