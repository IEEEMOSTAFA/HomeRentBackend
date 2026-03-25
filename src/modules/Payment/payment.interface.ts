// ================= PAYMENT RESPONSE TYPES =================

export type TPaymentIntent = {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  bookingId: string;
};

export type TPaymentConfirmed = {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  stripePaymentIntentId: string;
  receiptUrl: string | null;
  createdAt: Date;
  confirmedAt?: Date;
};

export type TPayment = {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  stripePaymentIntentId: string | null;
  stripeSessionId: string | null;
  receiptUrl: string | null;
  refundAmount: number | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: {
    id: string;
    propertyId: string;
    userId: string;
    moveInDate: Date;
    moveOutDate: Date | null;
    totalAmount: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
};

export type TPaymentWithBooking = TPayment & {
  booking: {
    id: string;
    propertyId: string;
    userId: string;
    moveInDate: Date;
    moveOutDate: Date | null;
    totalAmount: number;
    property?: {
      id: string;
      title: string;
      rentAmount: number;
    };
  };
};

export type TPaginatedPayments = {
  data: TPayment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type TStripeWebhookEvent = {
  type: string;
  object: string;
  data: {
    object: {
      id: string;
      client_secret: string;
      status: string;
      amount: number;
      currency: string;
      metadata?: Record<string, string>;
    };
  };
};

export type TRefundRequest = {
  paymentId: string;
  refundAmount?: number;
  reason?: string;
};

export type TRefundResponse = {
  id: string;
  paymentId: string;
  refundAmount: number;
  status: string;
  refundedAt: Date;
};