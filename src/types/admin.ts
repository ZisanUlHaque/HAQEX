export type Hub = {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  district: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export type HubInput = Omit<Hub, "id" | "createdAt">;

export type AdminUserQuery = {
  page?: number;
  limit?: number;
  role?: UserData["role"];
  status?: UserData["status"];
  search?: string;
};

export type AdminHubQuery = {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  status?: Hub["status"];
};

export type UserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "COURIER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};