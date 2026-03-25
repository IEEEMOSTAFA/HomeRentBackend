export type TOwnerProfile = {
  id: string;
  userId: string;
  phone?: string | null;
  nidNumber?: string | null;
  verified: boolean;
  verifiedAt?: Date | null;
  totalProperties: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TOwnerProfileCreateInput = {
  phone?: string;
  nidNumber?: string;
};

export type TOwnerProfileUpdateInput = Partial<Omit<TOwnerProfile, "id" | "userId" | "createdAt" | "updatedAt">>;

export type TOwnerWithUser = TOwnerProfile & {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};

export type TOwnerStats = {
  totalProperties: number;
  totalEarnings: number;
  rating: number;
  totalReviews: number;
};