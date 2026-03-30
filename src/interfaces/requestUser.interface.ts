import { UserRole } from "../../generated/prisma";

export interface IRequestUser {
  id: string;
  email: string;
  role: UserRole;
}