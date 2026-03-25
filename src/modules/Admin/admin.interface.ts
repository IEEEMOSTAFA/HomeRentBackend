export type TAdminActions = {
  id: string;
  action: string;
  targetType: "user" | "property" | "booking" | "review";
  targetId: string;
  details?: string | null;
  timestamp: Date;
};

export type TPropertyApprovalRequest = {
  propertyId: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};

export type TUserVerificationRequest = {
  ownerProfileId: string;
  verified: boolean;
  action: "approve" | "reject";
};

export type TBanUserRequest = {
  userId: string;
  isBanned: boolean;
  reason?: string;
};

export type TReviewFlagAction = {
  reviewId: string;
  isFlagged: boolean;
  isVisible: boolean;
  adminNote?: string;
};

export type TAdminStats = {
  totalUsers: number;
  totalOwners: number;
  totalProperties: number;
  pendingPropertyApprovals: number;
  bannedUsers: number;
  flaggedReviews: number;
};