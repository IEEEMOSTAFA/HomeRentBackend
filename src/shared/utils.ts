/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Format date to readable string
 * @param date - Date to format
 * @param locale - Locale code (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, locale: string = "en-US"): string => {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

/**
 * Calculate days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days
 */
export const daysBetween = (startDate: Date, endDate: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / msPerDay);
};

/**
 * Convert price to BDT currency format
 * @param amount - Amount in BDT
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("bn-BD", {
    style: "currency",
    currency: "BDT",
  }).format(amount);
};

/**
 * Generate slug from string
 * @param str - String to slugify
 * @returns Slug string
 */
export const generateSlug = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Truncate string to specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to append (default: '...')
 * @returns Truncated string
 */
export const truncate = (str: string, length: number, suffix: string = "..."): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Remove extra whitespace from string
 * @param str - String to clean
 * @returns Cleaned string
 */
export const cleanString = (str: string): string => {
  return str.trim().replace(/\s+/g, " ");
};

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert array to comma-separated string
 * @param arr - Array to convert
 * @returns Comma-separated string
 */
export const toCommaSeparated = (arr: string[]): string => {
  return arr.join(", ");
};

/**
 * Check if object has all required fields
 * @param obj - Object to check
 * @param requiredFields - Array of required field names
 * @returns Boolean indicating if all required fields exist
 */
export const hasRequiredFields = (obj: any, requiredFields: string[]): boolean => {
  return requiredFields.every((field) => field in obj && obj[field] !== null && obj[field] !== undefined);
};

/**
 * Pick specific fields from object
 * @param obj - Source object
 * @param fields - Fields to pick
 * @returns New object with only picked fields
 */
export const pickFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Partial<T> => {
  const result = {} as Partial<T>;
  fields.forEach((field) => {
    if (field in obj) {
      result[field] = obj[field];
    }
  });
  return result;
};

/**
 * Omit specific fields from object
 * @param obj - Source object
 * @param fields - Fields to omit
 * @returns New object without omitted fields
 */
export const omitFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): Partial<T> => {
  const result = { ...obj };
  fields.forEach((field) => {
    delete result[field];
  });
  return result;
};

/**
 * Merge multiple objects
 * @param objects - Objects to merge
 * @returns Merged object
 */
export const mergeObjects = <T extends Record<string, any>>(...objects: T[]): T => {
  return objects.reduce((acc, obj) => ({ ...acc, ...obj }), {} as T);
};

/**
 * Generate random string
 * @param length - Length of random string
 * @returns Random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after sleep
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Initial delay in milliseconds
 * @returns Result from function
 */
export const retryAsync = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(delayMs * Math.pow(2, i));
    }
  }
  throw new Error("Max retries exceeded");
};
