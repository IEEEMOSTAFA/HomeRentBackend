/**
 * Validation Utility Functions
 * Helper functions for common validation patterns
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns Boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Boolean indicating if password meets requirements
 * Requirements: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number (Bangladesh format)
 * @param phone - Phone number to validate
 * @returns Boolean indicating if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  // Bangladesh phone: +880XXXXXXXXXX or 01XXXXXXXXXX or 880XXXXXXXXXX
  const phoneRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Check if string is valid ObjectId (MongoDB style)
 * @param id - ID string to validate
 * @returns Boolean indicating if valid ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[a-z0-9]{20,}$/.test(id);
};

/**
 * Check if value is valid enum
 * @param value - Value to check
 * @param enumObj - Enum object
 * @returns Boolean indicating if value exists in enum
 */
export const isValidEnum = (value: any, enumObj: Record<string, any>): boolean => {
  return Object.values(enumObj).includes(value);
};

/**
 * Check if number is within range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Boolean indicating if value is in range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Check if string length is within range
 * @param str - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns Boolean indicating if length is in range
 */
export const isValidLength = (str: string, min: number, max: number): boolean => {
  return str.length >= min && str.length <= max;
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Cloudinary URL
 * @param url - URL to validate
 * @returns Boolean indicating if URL is from Cloudinary
 */
export const isCloudinaryUrl = (url: string): boolean => {
  return url.startsWith("https://res.cloudinary.com/");
};

/**
 * Validate date string
 * @param dateStr - Date string to validate
 * @returns Boolean indicating if date is valid
 */
export const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if provided date is in future
 * @param dateStr - Date string to check
 * @returns Boolean indicating if date is in future
 */
export const isFutureDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date > new Date();
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param value - Value to check
 * @returns Boolean indicating if value is empty
 */
export const isEmpty = (value: any): boolean => {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
};
