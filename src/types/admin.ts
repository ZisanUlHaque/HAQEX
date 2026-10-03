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

export type UserData = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "CUSTOMER" | "COURIER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
};