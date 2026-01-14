'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RequireRole';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { getUser } from '@/lib/auth';
import { apiRequest } from '@/lib/api/client';

interface Plan {
  id: string;
  name: string;
  price: number;
  billingInterval: string;
  features: string[];
}

interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate?: string;
}

interface Entitlements {
  maxJobPostings: number;
  maxApplications: number;
  maxMessagesPerMonth: number;
  currentJobPostings: number;
  currentApplications: number;
  currentMessagesThisMonth: number;
}

export default function BillingPage() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['BusinessOwner']}>
        <BillingContent />
      </RequireRole>
    </RequireAuth>
  );
}

function BillingContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const user = getUser();
  const organizationId = user?.organizationId || '';

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      try {
        // Fetch plans
        const plansResponse = await apiRequest<any>('/api/billing/plans');
        if (plansResponse.success && plansResponse.data) {
          const plans = Array.isArray(plansResponse.data) ? plansResponse.data : plansResponse.data.data || [];
          setPlans(plans);
        }

        // Fetch current subscription
        if (organizationId) {
          const subResponse = await apiRequest<any>(`/api/billing/subscription/${organizationId}`);
          if (subResponse.success && subResponse.data) {
            setSubscription(subResponse.data);
          }

          // Fetch entitlements
          const entResponse = await apiRequest<any>(`/api/entitlements/${organizationId}`);
          if (entResponse.success && entResponse.data) {
            setEntitlements(entResponse.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [organizationId]);

  const handleSubscribe = async (planId: string) => {
    if (!organizationId) {
      alert('Organization ID not found');
      return;
    }

    setSubscribing(true);
    try {
      const response = await apiRequest<any>('/api/billing/subscribe', {
        method: 'POST',
        body: JSON.stringify({ organizationId, planId })
      });

      if (response.success) {
        alert('Successfully subscribed!');
        // Refresh data
        window.location.reload();
      } else {
        alert(`Failed to subscribe: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Billing & Subscriptions"
          description="Manage your subscription plan and track usage"
          backLink={{ href: '/business', label: 'Back to Dashboard' }}
        />

        {/* Current Subscription */}
        {subscription && (
          <Card variant="default" className="mb-8">
            <CardBody>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-4">Current Subscription</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-[var(--brand-primary)]">{subscription.planName}</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-semibold ${subscription.status === 'Active' ? 'text-green-600' : 'text-gray-600'}`}>
                      {subscription.status}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {new Date(subscription.startDate).toLocaleDateString()}
                    {subscription.endDate && ` • Ends: ${new Date(subscription.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Usage & Entitlements */}
        {entitlements && (
          <Card variant="default" className="mb-8">
            <CardBody>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-4">Usage & Limits</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Job Postings</span>
                    <span className="text-sm text-gray-600">
                      {entitlements.currentJobPostings} / {entitlements.maxJobPostings}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[var(--brand-primary)] h-2 rounded-full"
                      style={{ width: `${(entitlements.currentJobPostings / entitlements.maxJobPostings) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Applications</span>
                    <span className="text-sm text-gray-600">
                      {entitlements.currentApplications} / {entitlements.maxApplications === -1 ? 'Unlimited' : entitlements.maxApplications}
                    </span>
                  </div>
                  {entitlements.maxApplications !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[var(--brand-primary)] h-2 rounded-full"
                        style={{ width: `${(entitlements.currentApplications / entitlements.maxApplications) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Messages This Month</span>
                    <span className="text-sm text-gray-600">
                      {entitlements.currentMessagesThisMonth} / {entitlements.maxMessagesPerMonth === -1 ? 'Unlimited' : entitlements.maxMessagesPerMonth}
                    </span>
                  </div>
                  {entitlements.maxMessagesPerMonth !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[var(--brand-primary)] h-2 rounded-full"
                        style={{ width: `${(entitlements.currentMessagesThisMonth / entitlements.maxMessagesPerMonth) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Available Plans */}
        <h3 className="text-2xl font-bold text-[var(--brand-navy)] mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              variant="default"
              className={`${subscription?.planId === plan.id ? 'border-2 border-[var(--brand-primary)]' : ''}`}
            >
              <CardBody>
                {subscription?.planId === plan.id && (
                  <div className="mb-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[var(--brand-primary)] text-white">
                      Current Plan
                    </span>
                  </div>
                )}
                <h4 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">{plan.name}</h4>
                <p className="text-3xl font-bold text-[var(--brand-primary)] mb-1">
                  £{plan.price}
                  <span className="text-sm font-normal text-gray-600">/{plan.billingInterval}</span>
                </p>
                <ul className="space-y-2 my-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {subscription?.planId !== plan.id && (
                  <Button
                    variant="primary"
                    className="w-full bg-[var(--brand-primary)]"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing}
                  >
                    {subscribing ? 'Subscribing...' : 'Subscribe'}
                  </Button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
