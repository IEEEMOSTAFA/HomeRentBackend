import { Response } from "express";

/**
 * Generic Response Interface
 * Unified response format for all API endpoints
 * Aligns with schema and PRD requirements
 */
export interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Send standardized API response
 * Usage: sendResponse(res, { statusCode: 200, success: true, message: "...", data: {...} })
 * 
 * @param res - Express Response object
 * @param data - Response payload following IApiResponse interface
 */
const sendResponse = <T>(
  res: Response,
  data: IApiResponse<T>
): void => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    data: data.data ?? null,
  });
};

export default sendResponse;
