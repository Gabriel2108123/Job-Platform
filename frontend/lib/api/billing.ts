import { apiRequest } from './client';

/**
 * Billing API endpoints
 */

export interface Plan {
  id: string;
  name: string;
  description: string;
  planType: string;
  priceInCents: number;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  stripeSubscriptionId: string;
  status: string;
  planType: string;
  startDate: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  priceInCents: number;
  trialEndsAt?: string;
}

export interface CreateSubscriptionRequest {
  organizationId: string;
  planType: string;
  stripePaymentMethodId: string;
}

/**
 * Get all available billing plans
 */
export async function getPlans() {
  return apiRequest<Plan[]>('/api/billing/plans');
}

/**
 * Get subscription for organization
 */
export async function getSubscription(organizationId: string) {
  return apiRequest<Subscription | null>(`/api/billing/subscription/${organizationId}`);
}

/**
 * Create new subscription
 */
export async function createSubscription(data: CreateSubscriptionRequest) {
  return apiRequest<Subscription>('/api/billing/subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(organizationId: string) {
  return apiRequest<void>(`/api/billing/subscription/${organizationId}`, {
    method: 'DELETE',
  });
}
