/**
 * User roles in the platform
 */
export enum UserRole {
  Candidate = 'Candidate',
  BusinessOwner = 'BusinessOwner',
  Staff = 'Staff',
  Admin = 'Admin',
  Support = 'Support',
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Organization interface
 */
export interface Organization {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
}
