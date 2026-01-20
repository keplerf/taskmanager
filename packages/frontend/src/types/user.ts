/**
 * Base user information used throughout the application
 */
export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

/**
 * Full user account information (extends UserInfo with email)
 */
export interface User extends UserInfo {
  email: string;
}

/**
 * User with email for contexts that need it (like workspace users)
 */
export interface UserWithEmail extends UserInfo {
  email: string;
}
