export type UserRole = "CUSTOMER" | "ADMIN" | "COURIER";
export type UserStatus = "ACTIVE" | "SUSPENDED";


export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  googleId: null | string;
  authProvider: string;
  emailVerified: boolean;
  role: UserRole;
  status: UserStatus;
  needPasswordChange: boolean;
  imageUrl: null | string;
  imagePublicId: null | string;
  profileImage?: string | null;
  isDeleted: boolean;
  deletedAt: null | string;
  createdAt: string;
  updatedAt: string;
}
