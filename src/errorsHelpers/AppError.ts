import httpStatus from "http-status";

// ================= APP ERROR CLASS =================
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = httpStatus.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export default AppError;
