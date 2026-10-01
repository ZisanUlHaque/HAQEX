export interface RegistrationPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: "CUSTOMER" | "COURIER";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}
