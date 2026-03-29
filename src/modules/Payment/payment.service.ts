import httpStatus from "http-status";
import Stripe from "stripe";
import { Stripe as StripeClient } from "stripe";
import { prisma } from "../../lib/prisma";
import AppError from "../../errors/AppError";
import { PaymentMessages, PaymentErrors, PaymentDefaults } from "./payment.constant";
import {
  CreatePaymentIntentInput,
  ConfirmPaymentInput,
  GetAllPaymentsInput,
  GetMyPaymentsInput,
  RefundPaymentInput,
} from "./payment.validation";

// ================= STRIPE INITIALIZATION =================

let stripeInstance: StripeClient | null = null;

const initializeStripe = (): StripeClient => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new AppError(
        "STRIPE_SECRET_KEY not configured in .env",
        httpStatus.INTERNAL_SERVER_ERROR
      );
    }
    stripeInstance = new Stripe(secretKey);
  }
  return stripeInstance;
};

// Initialize Stripe instance immediately on module load
const getStripeInstance = (): StripeClient => {
  if (!stripeInstance) {
    return initializeStripe();
  }
  return stripeInstance;
};

// stripe instance is now stripeInstance (singleton)

// ================= UTILITY FUNCTIONS =================

const calculatePagination = (page: number, pageSize: number) => ({
  skip: (page - 1) * pageSize,
  page,
  pageSize,
});

const buildPaginationResponse = (
  data: any[],
  total: number,
  page: number,
  pageSize: number
) => ({
  data,
  pagination: {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  },
});

// ================= PAYMENT INTENT SERVICE =================

const createPaymentIntentFromDB = async (
  userId: string,
  data: CreatePaymentIntentInput
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      property: {
        select: { id: true, title: true, ownerId: true },
      },
      payment: {
        select: { id: true, status: true },
      },
    },
  });

  if (!booking) {
    throw new AppError(PaymentErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Verify user owns this booking
  if (booking.userId !== userId) {
    throw new AppError(
      PaymentErrors.UNAUTHORIZED_ACCESS,
      httpStatus.FORBIDDEN
    );
  }

  // Check if booking is in valid state for payment
  if (booking.status !== "ACCEPTED") {
    throw new AppError(
      PaymentErrors.INVALID_BOOKING_STATUS,
      httpStatus.BAD_REQUEST
    );
  }

  // Check if payment already exists and is processing
  if (booking.payment && booking.payment.status !== "FAILED") {
    throw new AppError(
      PaymentErrors.PAYMENT_ALREADY_PROCESSED,
      httpStatus.BAD_REQUEST
    );
  }

  // Create Stripe PaymentIntent
  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(booking.totalAmount * 100),
    currency: PaymentDefaults.CURRENCY.toLowerCase(),
    description: `Booking for ${booking.property.title}`,
    statement_descriptor_suffix: "HomeRent",    
    metadata: {

      bookingId: booking.id,
      userId: userId,
      propertyId: booking.propertyId
    },
  });

  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(booking.totalAmount * 100), // Convert to cents
  //   currency: PaymentDefaults.CURRENCY.toLowerCase(),
  //   description: `Booking for ${booking.property.title}`,
  //   statement_descriptor: "HomeRent Booking",
  //   metadata: {
  //     bookingId: booking.id,
  //     userId: userId,
  //     propertyId: booking.propertyId,
  //   },
  // });

  // Create or update Payment record
  const payment = await prisma.payment.upsert({
    where: {
      bookingId: booking.id,
    },
    create: {
      bookingId: booking.id,
      userId: userId,
      amount: booking.totalAmount,
      currency: PaymentDefaults.CURRENCY,
      status: "PENDING",
      stripePaymentIntentId: paymentIntent.id,
    },
    update: {
      stripePaymentIntentId: paymentIntent.id,
      status: "PENDING",
    },
  });

  // Update booking status to PAYMENT_PENDING
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "PAYMENT_PENDING" },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: booking.totalAmount,
    currency: PaymentDefaults.CURRENCY,
    bookingId: booking.id,
  };
};

// ================= PAYMENT CONFIRMATION SERVICE =================

const confirmPaymentIntoDB = async (
  userId: string,
  data: ConfirmPaymentInput
) => {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: data.paymentIntentId },
    include: { booking: true, user: true },
  });

  if (!payment) {
    throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Verify user owns this payment
  if (payment.userId !== userId) {
    throw new AppError(
      PaymentErrors.UNAUTHORIZED_ACCESS,
      httpStatus.FORBIDDEN
    );
  }

  // Retrieve PaymentIntent from Stripe to confirm status
  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.retrieve(
    data.paymentIntentId
  );

  if (paymentIntent.status !== "succeeded") {
    throw new AppError(PaymentErrors.PAYMENT_NOT_CONFIRMED, httpStatus.BAD_REQUEST);
  }

  // Update payment AND booking atomically
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        receiptUrl: paymentIntent.receipt_email ? "receipt_generated" : null,
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    }),
  ]);

  // Return fresh data with updated booking status
  const freshPayment = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: {
      booking: {
        include: {
          property: {
            select: { id: true, title: true },
          },
        },
      },
    },
  });

  // TODO: Trigger notification to owner and user

  return freshPayment;
};

// ================= STRIPE WEBHOOK SERVICE =================

const handleWebhookEventFromStripe = async (
  event: any
) => {
  const paymentIntent = event.data.object;

  switch (event.type) {
    case "payment_intent.succeeded": {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            receiptUrl: paymentIntent.receipt_email ? "receipt_generated" : null,
          },
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "PENDING" }, // Reset to pending so user can retry
        });
      }
      break;
    }

    case "payment_intent.canceled": {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: paymentIntent.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });
      }
      break;
    }

    default:
      break;
  }

  return { success: true, message: PaymentMessages.WEBHOOK_PROCESSED };
};

// ================= PAYMENT RETRIEVAL SERVICES =================

const getPaymentByBookingIdFromDB = async (
  bookingId: string,
  userId: string,
  userRole: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          property: {
            select: { id: true, title: true, rentAmount: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!payment) {
    throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Check authorization: user can see own payment, admin can see all
  if (userRole !== "ADMIN" && payment.userId !== userId) {
    throw new AppError(
      PaymentErrors.UNAUTHORIZED_ACCESS,
      httpStatus.FORBIDDEN
    );
  }

  return payment;
};

const getPaymentByIdFromDB = async (
  paymentId: string,
  userId: string,
  userRole: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          property: {
            select: { id: true, title: true, rentAmount: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!payment) {
    throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Check authorization
  if (userRole !== "ADMIN" && payment.userId !== userId) {
    throw new AppError(
      PaymentErrors.UNAUTHORIZED_ACCESS,
      httpStatus.FORBIDDEN
    );
  }

  return payment;
};

const getAllPaymentsFromDB = async (filters: GetAllPaymentsInput) => {
  const { page = 1, pageSize = 20, status, userId, sortBy = "createdAt", sortOrder = "desc" } = filters;
  const { skip } = calculatePagination(page, pageSize);

  const where: any = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        booking: {
          include: {
            property: {
              select: { id: true, title: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.payment.count({ where }),
  ]);

  return buildPaginationResponse(payments, total, page, pageSize);
};

const getMyPaymentsFromDB = async (userId: string, filters: GetMyPaymentsInput) => {
  const { page = 1, pageSize = 20, status, sortBy = "createdAt", sortOrder = "desc" } = filters;
  const { skip } = calculatePagination(page, pageSize);

  const where: any = { userId };
  if (status) where.status = status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        booking: {
          include: {
            property: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.payment.count({ where }),
  ]);

  return buildPaginationResponse(payments, total, page, pageSize);
};

// ================= REFUND SERVICE =================

const refundPaymentIntoDB = async (
  adminId: string,
  data: RefundPaymentInput
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: data.paymentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
  }

  // Check if payment can be refunded
  if (payment.status !== "SUCCESS") {
    throw new AppError(
      PaymentErrors.REFUND_NOT_ALLOWED,
      httpStatus.BAD_REQUEST
    );
  }

  const refundAmount = data.refundAmount || payment.amount;

  // Validate refund amount
  if (refundAmount > payment.amount) {
    throw new AppError(
      PaymentErrors.INVALID_REFUND_AMOUNT,
      httpStatus.BAD_REQUEST
    );
  }

  // Create Stripe refund
  const stripe = getStripeInstance();
  const refund = await stripe.refunds.create({
    payment_intent: payment.stripePaymentIntentId!,
    amount: Math.round(refundAmount * 100), // Convert to cents
  });

  // Update payment record
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "REFUNDED",
      refundAmount: refundAmount,
      refundedAt: new Date(),
    },
  });

  // Update booking status
  if (payment.booking) {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });
  }

  // TODO: Trigger notification to user about refund

  return updatedPayment;
};

// ================= EXPORTED SERVICE OBJECT =================

export const PaymentService = {
  createPaymentIntent: createPaymentIntentFromDB,
  confirmPayment: confirmPaymentIntoDB,
  handleWebhook: handleWebhookEventFromStripe,
  getPaymentByBookingId: getPaymentByBookingIdFromDB,
  getPaymentById: getPaymentByIdFromDB,
  getAllPayments: getAllPaymentsFromDB,
  getMyPayments: getMyPaymentsFromDB,
  refundPayment: refundPaymentIntoDB,
};





















































// import httpStatus from "http-status";
// import Stripe from "stripe";
// import { Stripe as StripeClient } from "stripe";
// import { prisma } from "../../lib/prisma";
// import AppError from "../../errors/AppError";
// import { PaymentMessages, PaymentErrors, PaymentDefaults } from "./payment.constant";
// import {
//   CreatePaymentIntentInput,
//   ConfirmPaymentInput,
//   GetAllPaymentsInput,
//   GetMyPaymentsInput,
//   RefundPaymentInput,
// } from "./payment.validation";

// // ================= STRIPE INITIALIZATION =================

// let stripeInstance: StripeClient | null = null;

// const initializeStripe = (): StripeClient => {
//   if (!stripeInstance) {
//     const secretKey = process.env.STRIPE_SECRET_KEY;
//     if (!secretKey) {
//       throw new AppError(
//         "STRIPE_SECRET_KEY not configured in .env",
//         httpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//     stripeInstance = new Stripe(secretKey);
//   }
//   return stripeInstance;
// };

// // Initialize Stripe instance immediately on module load
// const getStripeInstance = (): StripeClient => {
//   if (!stripeInstance) {
//     return initializeStripe();
//   }
//   return stripeInstance;
// };

// // stripe instance is now stripeInstance (singleton)

// // ================= UTILITY FUNCTIONS =================

// const calculatePagination = (page: number, pageSize: number) => ({
//   skip: (page - 1) * pageSize,
//   page,
//   pageSize,
// });

// const buildPaginationResponse = (
//   data: any[],
//   total: number,
//   page: number,
//   pageSize: number
// ) => ({
//   data,
//   pagination: {
//     page,
//     pageSize,
//     total,
//     totalPages: Math.ceil(total / pageSize),
//   },
// });

// // ================= PAYMENT INTENT SERVICE =================

// const createPaymentIntentFromDB = async (
//   userId: string,
//   data: CreatePaymentIntentInput
// ) => {
//   const booking = await prisma.booking.findUnique({
//     where: { id: data.bookingId },
//     include: {
//       property: {
//         select: { id: true, title: true, ownerId: true },
//       },
//       payment: {
//         select: { id: true, status: true },
//       },
//     },
//   });

//   if (!booking) {
//     throw new AppError(PaymentErrors.BOOKING_NOT_FOUND, httpStatus.NOT_FOUND);
//   }

//   // Verify user owns this booking
//   if (booking.userId !== userId) {
//     throw new AppError(
//       PaymentErrors.UNAUTHORIZED_ACCESS,
//       httpStatus.FORBIDDEN
//     );
//   }

//   // Check if booking is in valid state for payment
//   if (booking.status !== "ACCEPTED") {
//     throw new AppError(
//       PaymentErrors.INVALID_BOOKING_STATUS,
//       httpStatus.BAD_REQUEST
//     );
//   }

//   // Check if payment already exists and is processing
//   if (booking.payment && booking.payment.status !== "FAILED") {
//     throw new AppError(
//       PaymentErrors.PAYMENT_ALREADY_PROCESSED,
//       httpStatus.BAD_REQUEST
//     );
//   }

//   // Create Stripe PaymentIntent
//   const stripe = getStripeInstance();
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: Math.round(booking.totalAmount * 100),
//     currency: PaymentDefaults.CURRENCY.toLowerCase(),
//     description: `Booking for ${booking.property.title}`,
//     statement_descriptor_suffix: "HomeRent",    
//     metadata: {

//       bookingId: booking.id,
//       userId: userId,
//       propertyId: booking.propertyId
//     },
//   });

//   // const paymentIntent = await stripe.paymentIntents.create({
//   //   amount: Math.round(booking.totalAmount * 100), // Convert to cents
//   //   currency: PaymentDefaults.CURRENCY.toLowerCase(),
//   //   description: `Booking for ${booking.property.title}`,
//   //   statement_descriptor: "HomeRent Booking",
//   //   metadata: {
//   //     bookingId: booking.id,
//   //     userId: userId,
//   //     propertyId: booking.propertyId,
//   //   },
//   // });

//   // Create or update Payment record
//   const payment = await prisma.payment.upsert({
//     where: {
//       bookingId: booking.id,
//     },
//     create: {
//       bookingId: booking.id,
//       userId: userId,
//       amount: booking.totalAmount,
//       currency: PaymentDefaults.CURRENCY,
//       status: "PENDING",
//       stripePaymentIntentId: paymentIntent.id,
//     },
//     update: {
//       stripePaymentIntentId: paymentIntent.id,
//       status: "PENDING",
//     },
//   });

//   // Update booking status to PAYMENT_PENDING
//   await prisma.booking.update({
//     where: { id: booking.id },
//     data: { status: "PAYMENT_PENDING" },
//   });

//   return {
//     clientSecret: paymentIntent.client_secret,
//     paymentIntentId: paymentIntent.id,
//     amount: booking.totalAmount,
//     currency: PaymentDefaults.CURRENCY,
//     bookingId: booking.id,
//   };
// };

// // ================= PAYMENT CONFIRMATION SERVICE =================

// const confirmPaymentIntoDB = async (
//   userId: string,
//   data: ConfirmPaymentInput
// ) => {
//   const payment = await prisma.payment.findUnique({
//     where: { stripePaymentIntentId: data.paymentIntentId },
//     include: { booking: true, user: true },
//   });

//   if (!payment) {
//     throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
//   }

//   // Verify user owns this payment
//   if (payment.userId !== userId) {
//     throw new AppError(
//       PaymentErrors.UNAUTHORIZED_ACCESS,
//       httpStatus.FORBIDDEN
//     );
//   }

//   // Retrieve PaymentIntent from Stripe to confirm status
//   const stripe = getStripeInstance();
//   const paymentIntent = await stripe.paymentIntents.retrieve(
//     data.paymentIntentId
//   );

//   if (paymentIntent.status !== "succeeded") {
//     throw new AppError(PaymentErrors.PAYMENT_NOT_CONFIRMED, httpStatus.BAD_REQUEST);
//   }

//   // Update payment status
//   const updatedPayment = await prisma.payment.update({
//     where: { id: payment.id },
//     data: {
//       status: "SUCCESS",
//       receiptUrl: paymentIntent.receipt_email ? "receipt_generated" : null,
//     },
//     include: {
//       booking: {
//         include: {
//           property: {
//             select: { id: true, title: true },
//           },
//         },
//       },
//     },
//   });

//   // Update booking status to CONFIRMED
//   await prisma.booking.update({
//     where: { id: payment.bookingId },
//     data: {
//       status: "CONFIRMED",
//       confirmedAt: new Date(),
//     },
//   });

//   // TODO: Trigger notification to owner and user

//   return updatedPayment;
// };

// // ================= STRIPE WEBHOOK SERVICE =================

// const handleWebhookEventFromStripe = async (
//   event: any
// ) => {
//   const paymentIntent = event.data.object;

//   switch (event.type) {
//     case "payment_intent.succeeded": {
//       const payment = await prisma.payment.findUnique({
//         where: { stripePaymentIntentId: paymentIntent.id },
//       });

//       if (payment) {
//         await prisma.payment.update({
//           where: { id: payment.id },
//           data: {
//             status: "SUCCESS",
//             receiptUrl: paymentIntent.receipt_email ? "receipt_generated" : null,
//           },
//         });

//         await prisma.booking.update({
//           where: { id: payment.bookingId },
//           data: {
//             status: "CONFIRMED",
//             confirmedAt: new Date(),
//           },
//         });
//       }
//       break;
//     }

//     case "payment_intent.payment_failed": {
//       const payment = await prisma.payment.findUnique({
//         where: { stripePaymentIntentId: paymentIntent.id },
//       });

//       if (payment) {
//         await prisma.payment.update({
//           where: { id: payment.id },
//           data: { status: "FAILED" },
//         });

//         await prisma.booking.update({
//           where: { id: payment.bookingId },
//           data: { status: "PENDING" }, // Reset to pending so user can retry
//         });
//       }
//       break;
//     }

//     case "payment_intent.canceled": {
//       const payment = await prisma.payment.findUnique({
//         where: { stripePaymentIntentId: paymentIntent.id },
//       });

//       if (payment) {
//         await prisma.payment.update({
//           where: { id: payment.id },
//           data: { status: "FAILED" },
//         });
//       }
//       break;
//     }

//     default:
//       break;
//   }

//   return { success: true, message: PaymentMessages.WEBHOOK_PROCESSED };
// };

// // ================= PAYMENT RETRIEVAL SERVICES =================

// const getPaymentByBookingIdFromDB = async (
//   bookingId: string,
//   userId: string,
//   userRole: string
// ) => {
//   const payment = await prisma.payment.findUnique({
//     where: { bookingId },
//     include: {
//       booking: {
//         include: {
//           property: {
//             select: { id: true, title: true, rentAmount: true },
//           },
//         },
//       },
//       user: {
//         select: { id: true, name: true, email: true },
//       },
//     },
//   });

//   if (!payment) {
//     throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
//   }

//   // Check authorization: user can see own payment, admin can see all
//   if (userRole !== "ADMIN" && payment.userId !== userId) {
//     throw new AppError(
//       PaymentErrors.UNAUTHORIZED_ACCESS,
//       httpStatus.FORBIDDEN
//     );
//   }

//   return payment;
// };

// const getPaymentByIdFromDB = async (
//   paymentId: string,
//   userId: string,
//   userRole: string
// ) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//     include: {
//       booking: {
//         include: {
//           property: {
//             select: { id: true, title: true, rentAmount: true },
//           },
//         },
//       },
//       user: {
//         select: { id: true, name: true, email: true },
//       },
//     },
//   });

//   if (!payment) {
//     throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
//   }

//   // Check authorization
//   if (userRole !== "ADMIN" && payment.userId !== userId) {
//     throw new AppError(
//       PaymentErrors.UNAUTHORIZED_ACCESS,
//       httpStatus.FORBIDDEN
//     );
//   }

//   return payment;
// };

// const getAllPaymentsFromDB = async (filters: GetAllPaymentsInput) => {
//   const { page = 1, pageSize = 20, status, userId, sortBy = "createdAt", sortOrder = "desc" } = filters;
//   const { skip } = calculatePagination(page, pageSize);

//   const where: any = {};
//   if (status) where.status = status;
//   if (userId) where.userId = userId;

//   const [payments, total] = await Promise.all([
//     prisma.payment.findMany({
//       where,
//       skip,
//       take: pageSize,
//       include: {
//         booking: {
//           include: {
//             property: {
//               select: { id: true, title: true },
//             },
//           },
//         },
//         user: {
//           select: { id: true, name: true, email: true },
//         },
//       },
//       orderBy: { [sortBy]: sortOrder },
//     }),
//     prisma.payment.count({ where }),
//   ]);

//   return buildPaginationResponse(payments, total, page, pageSize);
// };

// const getMyPaymentsFromDB = async (userId: string, filters: GetMyPaymentsInput) => {
//   const { page = 1, pageSize = 20, status, sortBy = "createdAt", sortOrder = "desc" } = filters;
//   const { skip } = calculatePagination(page, pageSize);

//   const where: any = { userId };
//   if (status) where.status = status;

//   const [payments, total] = await Promise.all([
//     prisma.payment.findMany({
//       where,
//       skip,
//       take: pageSize,
//       include: {
//         booking: {
//           include: {
//             property: {
//               select: { id: true, title: true },
//             },
//           },
//         },
//       },
//       orderBy: { [sortBy]: sortOrder },
//     }),
//     prisma.payment.count({ where }),
//   ]);

//   return buildPaginationResponse(payments, total, page, pageSize);
// };

// // ================= REFUND SERVICE =================

// const refundPaymentIntoDB = async (
//   adminId: string,
//   data: RefundPaymentInput
// ) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: data.paymentId },
//     include: { booking: true },
//   });

//   if (!payment) {
//     throw new AppError(PaymentErrors.PAYMENT_NOT_FOUND, httpStatus.NOT_FOUND);
//   }

//   // Check if payment can be refunded
//   if (payment.status !== "SUCCESS") {
//     throw new AppError(
//       PaymentErrors.REFUND_NOT_ALLOWED,
//       httpStatus.BAD_REQUEST
//     );
//   }

//   const refundAmount = data.refundAmount || payment.amount;

//   // Validate refund amount
//   if (refundAmount > payment.amount) {
//     throw new AppError(
//       PaymentErrors.INVALID_REFUND_AMOUNT,
//       httpStatus.BAD_REQUEST
//     );
//   }

//   // Create Stripe refund
//   const stripe = getStripeInstance();
//   const refund = await stripe.refunds.create({
//     payment_intent: payment.stripePaymentIntentId!,
//     amount: Math.round(refundAmount * 100), // Convert to cents
//   });

//   // Update payment record
//   const updatedPayment = await prisma.payment.update({
//     where: { id: payment.id },
//     data: {
//       status: "REFUNDED",
//       refundAmount: refundAmount,
//       refundedAt: new Date(),
//     },
//   });

//   // Update booking status
//   if (payment.booking) {
//     await prisma.booking.update({
//       where: { id: payment.bookingId },
//       data: {
//         status: "CANCELLED",
//         cancelledAt: new Date(),
//       },
//     });
//   }

//   // TODO: Trigger notification to user about refund

//   return updatedPayment;
// };

// // ================= EXPORTED SERVICE OBJECT =================

// export const PaymentService = {
//   createPaymentIntent: createPaymentIntentFromDB,
//   confirmPayment: confirmPaymentIntoDB,
//   handleWebhook: handleWebhookEventFromStripe,
//   getPaymentByBookingId: getPaymentByBookingIdFromDB,
//   getPaymentById: getPaymentByIdFromDB,
//   getAllPayments: getAllPaymentsFromDB,
//   getMyPayments: getMyPaymentsFromDB,
//   refundPayment: refundPaymentIntoDB,
// };