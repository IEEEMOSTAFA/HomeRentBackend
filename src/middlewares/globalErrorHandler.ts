import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`❌ Error [${status}]:`, message);

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;