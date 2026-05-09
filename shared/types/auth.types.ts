import type { Role } from "../constants/roles";
export type AuthUser = { id: string; email: string; firstName: string; lastName?: string; role: Role };
export type AuthResponse = { token: string; user: AuthUser };

