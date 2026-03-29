import {
  BookingStatus,
  PaymentStatus,
  PropertyType,
  AvailableFor,
} from "../../../generated/prisma";

// ================= BOOKING REQUEST TYPES =================

export interface ICreateBooking {
  propertyId: string;
  moveInDate: string;
  moveOutDate?: string;
  message?: string;
  numberOfTenants?: number;
}

export interface IUpdateBookingStatus {
  status: "ACCEPTED" | "DECLINED";
  cancellationNote?: string;
}

export interface ICancelBooking {
  cancellationNote?: string;
}

// ================= QUERY TYPES =================

export interface IBookingQuery {
  page?: number;
  pageSize?: number;
  status?: BookingStatus;
}

// ================= RESPONSE TYPES =================

export interface IBookingPropertySnapshot {
  id: string;
  title: string;
  city: string;
  area: string;
  images: string[];
  rentAmount: number;
  type?: PropertyType;
  availableFor?: AvailableFor;
}

export interface IBookingUserSnapshot {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface IBookingPaymentSnapshot {
  id: string;
  status: PaymentStatus;
  amount: number;
  receiptUrl: string | null;
}

export interface IBookingResponse {
  id: string;
  propertyId: string;
  userId: string;
  moveInDate: Date;
  moveOutDate: Date | null;
  message: string | null;
  numberOfTenants: number;

  // Pricing snapshot (locked at booking time)
  rentAmount: number;
  bookingFee: number;
  totalAmount: number;

  status: BookingStatus;
  cancellationNote: string | null;

  expiresAt: Date | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Populated relations
  property?: IBookingPropertySnapshot;
  user?: IBookingUserSnapshot;
  payment?: IBookingPaymentSnapshot | null;
}

// ================= PAGINATED RESPONSE =================

export interface IPaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedBookings {
  data: IBookingResponse[];
  pagination: IPaginationMeta;
}