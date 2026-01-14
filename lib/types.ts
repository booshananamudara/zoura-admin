// Import shared types from backend
export type { UserRole, UserDto } from '@/types/user.dto';

// Alias for compatibility
import type { UserDto } from '@/types/user.dto';
export type User = UserDto;

export interface MockAuthContext {
    user: UserDto | null;
    isAuthenticated: boolean;
}
