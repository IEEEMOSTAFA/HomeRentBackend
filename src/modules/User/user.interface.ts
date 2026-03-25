export type TUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: "USER" | "OWNER" | "ADMIN";
  isActive: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type TUserResponse = Omit<TUser, "email"> & {
  email: string;
};

export type TUserCreateInput = {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "OWNER";
};

export type TUserUpdateInput = Partial<Omit<TUser, "id" | "email" | "createdAt">>;

export type TUserAuthResponse = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
  emailVerified: boolean;
};