// ============================================================
// review.interface.ts
// All TypeScript types & interfaces for the Review module
// ============================================================

// ─── ENUMS ───────────────────────────────────────────────────

export type TBookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "DECLINED"
  | "CANCELLED";

// ─── EMBEDDED SHAPES (nested selects returned by Prisma) ─────

export interface IReviewUser {
  id: string;
  name: string;
  image: string | null;
}

export interface IReviewUserAdmin {
  id: string;
  name: string;
  email: string;
}

export interface IReviewProperty {
  id: string;
  title: string;
}

export interface IReviewPropertyFull {
  id: string;
  title: string;
  city: string;
  area: string;
  images: string[];
}

// ─── CORE REVIEW ─────────────────────────────────────────────

/** Base Review as stored in DB */
export interface IReview {
  id: string;
  bookingId: string;
  propertyId: string;
  userId: string;
  rating: number;          // 1–5
  comment: string | null;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Review returned after creation (includes user + property) */
export interface IReviewCreated extends IReview {
  user: IReviewUser;
  property: IReviewProperty;
}

/** Review returned in a public property listing (user info only) */
export interface IReviewWithUser extends IReview {
  user: IReviewUser;
}

/** Review returned for USER's own review list (property info only) */
export interface IReviewWithProperty extends IReview {
  property: IReviewPropertyFull;
}

/** Review returned in Admin panel (user email included) */
export interface IReviewWithAdminDetails extends IReview {
  user: IReviewUserAdmin;
  property: IReviewProperty;
}

// ─── BOOKING SHAPE (used internally in createReview) ─────────

export interface IBookingForReview {
  id: string;
  propertyId: string;
  userId: string;
  status: TBookingStatus;
  property: {
    id: string;
    ownerId: string;
  };
  review: IReview | null;
}

// ─── PAGINATION ───────────────────────────────────────────────

export interface IPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  pagination: IPagination;
}

// ─── SERVICE PARAM TYPES ──────────────────────────────────────

export interface IGetReviewsParams {
  page?: number;
  pageSize?: number;
}

export interface IGetAllReviewsParams extends IGetReviewsParams {
  isFlagged?: boolean;
}

// ─── DELETE RESULT ────────────────────────────────────────────

export interface IDeleteReviewResult {
  id: string;
  message: string;
}