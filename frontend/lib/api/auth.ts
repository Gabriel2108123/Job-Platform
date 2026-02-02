import { apiRequest } from './client';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';
import { clearCurrentUser } from '../auth-helpers';

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials) => {
    return apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Register user
   */
  register: async (data: RegisterData) => {
    return apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return apiRequest('/api/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Send email verification (requires authentication)
   */
  sendVerification: async () => {
    return apiRequest<{ message: string }>('/api/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  /**
   * Client-side logout (clears all auth data from storage)
   * Note: Backend doesn't have logout endpoint - JWT is stateless
   */
  logout: () => {
    clearCurrentUser();
  },
};
