/**
 * Pagination Utility Functions
 * Helper functions for pagination calculations
 */

import { IPaginationQuery, IPaginationResult } from "./interface";

/**
 * Parse pagination parameters from query
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Pagination object with page, limit, skip
 */
export const parsePagination = (
  page?: number | string,
  limit?: number | string
) => {
  const pageNum = Math.max(1, parseInt(String(page)) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit)) || 10));
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

/**
 * Calculate pagination metadata
 * @param total - Total number of items
 * @param page - Current page
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export const calculatePaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Format paginated response
 * @param data - Array of items
 * @param total - Total count
 * @param page - Current page
 * @param limit - Items per page
 * @returns Formatted pagination result
 */
export const formatPaginatedResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): IPaginationResult<T> => {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
