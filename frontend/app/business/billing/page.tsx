'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { getUser } from '@/lib/auth';
import { apiRequest } from '@/lib/api/client';
import { RoleLayout } from '@/components/layout/RoleLayout';

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

interface Invoice {
  id: string;
  amountInCents: number;
  currency: string;
  status: string;
  stripeInvoiceId: string;
  invoiceUrl?: string;
  receiptUrl?: string;
  billedAt: string;
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
    <RoleLayout pageTitle="Billing & Subscriptions">
      <BillingContent />
    </RoleLayout>
  );
}

function BillingContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [history, setHistory] = useState<Invoice[]>([]);
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

          // Fetch billing history
          const historyResponse = await apiRequest<any>(`/api/billing/history/${organizationId}`);
          if (historyResponse.success && historyResponse.data) {
            setHistory(historyResponse.data);
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
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">Loading billing information...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <p className="text-slate-500 mb-8 -mt-4 text-lg">
        Manage your subscription plan and track usage
      </p>

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

      {/* Billing History */}
      {history.length > 0 && (
        <Card variant="default" className="mb-8 overflow-hidden">
          <CardBody className="p-0">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-[var(--brand-navy)]">Billing History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {new Date(invoice.billedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        £{(invoice.amountInCents / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.invoiceUrl ? (
                          <a
                            href={invoice.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--brand-primary)] hover:underline text-sm font-medium"
                          >
                            Download PDF
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">Not available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  );
}
