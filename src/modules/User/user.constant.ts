// ================= SEARCHABLE FIELDS =================
export const UserSearchableFields = [
  "name",
  "email",
];

// ================= USER MESSAGES =================
export const UserMessages = {
  USER_FETCHED: "User profile fetched successfully",
  USERS_FETCHED: "Users list fetched successfully",
  PROFILE_UPDATED: "User profile updated successfully",
  ROLE_CHANGED: "User role changed successfully",
  USER_BANNED: "User banned successfully",
  USER_UNBANNED: "User unbanned successfully",
  USER_DELETED: "User deleted successfully",
  EMAIL_VERIFIED: "Email verified successfully",
  EMAIL_VERIFIED_ALREADY: "Email already verified",
};

// ================= USER ERRORS =================
export const UserErrors = {
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Email is not verified",
  ACCOUNT_BANNED: "This account has been banned",
  ACCOUNT_INACTIVE: "This account is inactive",
  UNAUTHORIZED: "You do not have permission to perform this action",
  INVALID_ROLE: "Invalid role specified",
  CANNOT_DELETE_SELF: "You cannot delete your own account",
  CANNOT_BAN_SELF: "You cannot ban yourself",
};

// ================= USER DEFAULTS =================
export const USER_DEFAULTS = {
  PAGE_SIZE: 10,
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 2,
  MAX_PASSWORD_LENGTH: 50,
  MIN_PASSWORD_LENGTH: 8,
};