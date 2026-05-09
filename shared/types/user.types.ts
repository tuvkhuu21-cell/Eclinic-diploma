import type { Role } from "../constants/roles";
export type UserDto = { id: string; email: string; firstName: string; lastName?: string; phone?: string; role: Role; isActive: boolean };

