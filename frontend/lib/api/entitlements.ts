import { apiRequest } from './client';

/**
 * Entitlements API endpoints
 */

export interface EntitlementLimit {
  id: string;
  organizationId: string;
  limitType: string;
  maxLimit: number;
  currentUsage: number;
  remainingLimit: number;
  planType: string;
  resetDate?: string;
}

export interface LimitStatus {
  limitType: string;
  hasReachedLimit: boolean;
  remainingLimit: number;
}

/**
 * Get all entitlements for organization
 */
export async function getEntitlements(organizationId: string) {
  return apiRequest<EntitlementLimit[]>(`/api/entitlements/${organizationId}`);
}

/**
 * Check specific limit status
 */
export async function checkLimit(organizationId: string, limitType: string) {
  return apiRequest<LimitStatus>(`/api/entitlements/${organizationId}/check/${limitType}`);
}
