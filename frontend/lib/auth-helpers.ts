/**
 * Enhanced auth helpers for accessing user metadata from auth storage
 */

import { getUser } from './auth';

/**
 * Extended user info with organization and role
 */
export interface CurrentUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  organizationId?: string;
  role?: string;
}

/**
 * Get current user info from localStorage
 * Note: organizationId and role are stored as separate entries
 */
/**
 * Retrieves the current authenticated user info from localStorage.
 * Combines basic user data with extended organization and role information stored separately.
 * 
 * @returns The CurrentUser object if authenticated, otherwise null.
 */
export function getCurrentUser(): CurrentUser | null {
  const user = getUser();
  if (!user) return null;

  if (typeof window === 'undefined') return null;

  const organizationId = localStorage.getItem('organizationId');
  const role = localStorage.getItem('role');

  return {
    ...user,
    organizationId: organizationId || undefined,
    role: role || undefined,
  };
}

/**
 * Get organization ID from auth storage
 */
export function getOrganizationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('organizationId');
}

/**
 * Get user role from auth storage
 */
export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role');
}

/**
 * Check if user is a business owner/staff
 */
export function isBusinessUser(): boolean {
  const role = getUserRole();
  return role === 'BusinessOwner' || role === 'Staff' || role === 'Admin';
}

/**
 * Check if user is an admin
 */
export function isAdmin(): boolean {
  const role = getUserRole();
  return role === 'Admin';
}

/**
 * Check if user is a candidate
 */
export function isCandidate(): boolean {
  const role = getUserRole();
  return role === 'Candidate';
}

/**
 * Store extended auth info (typically called on login)
 */
export function setCurrentUser(
  user: CurrentUser,
  token: string
): void {
  if (typeof window === 'undefined') return;

  // Store in auth
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify({
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
  }));

  // Store extended info
  if (user.organizationId) {
    localStorage.setItem('organizationId', user.organizationId);
  }
  if (user.role) {
    localStorage.setItem('role', user.role);
  }
}

/**
 * Clear all auth info
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('organizationId');
  localStorage.removeItem('role');
}
