import { NextFunction, Request, Response } from "express";

/**
 * Generic Error Handler Type
 * Supports standard Error or custom AppError
 */
interface IError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Async Error Wrapper Middleware
 * Catches errors from async route handlers and passes to error handler
 * 
 * Usage:
 * ```
 * router.post("/endpoint", catchAsync(async (req, res) => {
 *   const result = await someAsyncOperation();
 *   res.json(result);
 * }));
 * ```
 * 
 * @param fn - Express route handler function
 * @returns Wrapped async function with try-catch
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error: any) {
      // Pass error to global error handler middleware
      next(error);
    }
  };
};

export default catchAsync;