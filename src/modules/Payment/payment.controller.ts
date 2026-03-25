import httpStatus from "http-status";
import Stripe from "stripe";
import { Request, Response, NextFunction } from "express";
import { PaymentService } from "./payment.service";
import { PaymentMessages, PaymentErrors } from "./payment.constant";
import {
  createPaymentIntentSchema,
  confirmPaymentSchema,
  getPaymentByBookingIdSchema,
  getPaymentByIdSchema,
  getAllPaymentsSchema,
  getMyPaymentsSchema,
  refundPaymentSchema,
} from "./payment.validation";
import AppError from "../../errors/AppError";

// ================= UTILITY FUNCTIONS =================

const handleValidationError = (res: Response, errors: any) => {
  return res.status(httpStatus.BAD_REQUEST).json({
    success: false,
    message: "Validation error",
    errors: errors.flatten(),
  });
};

// ================= PAYMENT INTENT HANDLERS =================

const createPaymentIntentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = createPaymentIntentSchema.safeParse({
      body: req.body,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.createPaymentIntent(
      userId,
      validation.data.body
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: PaymentMessages.PAYMENT_INTENT_CREATED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ================= PAYMENT CONFIRMATION HANDLERS =================

const confirmPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("User ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = confirmPaymentSchema.safeParse({
      body: req.body,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.confirmPayment(
      userId,
      validation.data.body
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.PAYMENT_CONFIRMED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ================= STRIPE WEBHOOK HANDLER =================

const stripeWebhookHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      throw new AppError("Missing Stripe signature", httpStatus.BAD_REQUEST);
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError(
        "Webhook secret not configured",
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }

    let body = (req as any).body;
    let event;
    try {
      event = Stripe.webhooks.constructEvent(
        body.toString(),
        signature,
        webhookSecret
      );
    } catch (error: any) {
      throw new AppError(
        `Webhook signature verification failed: ${error.message}`,
        httpStatus.BAD_REQUEST
      );
    }

    // Process the event
    const result = await PaymentService.handleWebhook(event);

    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

// ================= PAYMENT RETRIEVAL HANDLERS =================

const getPaymentByBookingIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError("User ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = getPaymentByBookingIdSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.getPaymentByBookingId(
      validation.data.params.bookingId,
      userId,
      userRole || "USER"
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.PAYMENT_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      throw new AppError("User ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = getPaymentByIdSchema.safeParse({
      params: req.params,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.getPaymentById(
      validation.data.params.id,
      userId,
      userRole || "USER"
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.PAYMENT_FETCHED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validation = getAllPaymentsSchema.safeParse({
      query: req.query,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.getAllPayments(validation.data.query);

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.ALL_PAYMENTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPaymentsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("User ID not found", httpStatus.UNAUTHORIZED);
    }

    const validation = getMyPaymentsSchema.safeParse({
      query: req.query,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.getMyPayments(userId, validation.data.query);

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.MY_PAYMENTS_FETCHED,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// ================= REFUND HANDLER =================

const refundPaymentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.user?.id;
    const userRole = req.user?.role;

    if (!adminId) {
      throw new AppError("Admin ID not found", httpStatus.UNAUTHORIZED);
    }

    if (userRole !== "ADMIN") {
      throw new AppError(
        PaymentErrors.UNAUTHORIZED_REFUND,
        httpStatus.FORBIDDEN
      );
    }

    const validation = refundPaymentSchema.safeParse({
      body: req.body,
    });

    if (!validation.success) {
      return handleValidationError(res, validation.error);
    }

    const result = await PaymentService.refundPayment(
      adminId,
      validation.data.body
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: PaymentMessages.PAYMENT_REFUNDED,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ================= EXPORTED CONTROLLER OBJECT =================

export const PaymentController = {
  createPaymentIntent: createPaymentIntentHandler,
  confirmPayment: confirmPaymentHandler,
  stripeWebhook: stripeWebhookHandler,
  getPaymentByBookingId: getPaymentByBookingIdHandler,
  getPaymentById: getPaymentByIdHandler,
  getAllPayments: getAllPaymentsHandler,
  getMyPayments: getMyPaymentsHandler,
  refundPayment: refundPaymentHandler,
};