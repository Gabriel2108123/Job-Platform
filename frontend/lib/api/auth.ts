import { apiRequest } from './client';
import type { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

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
   * Logout user
   */
  logout: async () => {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
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
   * Refresh token
   */
  refreshToken: async (refreshToken: string) => {
    return apiRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
