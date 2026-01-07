/**
 * Auth helpers for client-side auth state management
 */

export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name?: string;
}

/**
 * Get auth token from localStorage (client-side only)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Get user from localStorage (client-side only)
 */
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getToken() !== null && getUser() !== null;
}

/**
 * Check if user's email is verified
 */
export function isEmailVerified(): boolean {
  const user = getUser();
  return user?.emailVerified ?? false;
}

/**
 * Store auth token and user info (typically called on login)
 */
export function setAuth(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth (typically called on logout)
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
