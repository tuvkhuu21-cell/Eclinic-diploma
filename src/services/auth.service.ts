import { api } from "./api";
import type { AuthUser } from "@/store/auth.store";

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const authService = {
  login: (data: unknown) => api.post<ApiResponse<AuthResponse>>("/auth/login", data),
  register: (data: unknown) => api.post<ApiResponse<AuthResponse>>("/auth/register", data),
  me: () => api.get("/auth/me"),
};
