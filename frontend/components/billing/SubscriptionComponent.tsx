'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/types/auth';
import { getSubscription, cancelSubscription, Subscription } from '@/lib/api/billing';

interface SubscriptionPageProps {
  user: User | null;
  organizationId: string;
}

export default function SubscriptionPage({ user, organizationId }: SubscriptionPageProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      setLoading(true);
      const response = await getSubscription(organizationId);
      if (response.success) {
        setSubscription(response.data || null);
      } else {
        setError(response.error || 'Failed to load subscription');
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [organizationId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setCancelling(true);
    setError(null);

    try {
      const response = await cancelSubscription(organizationId);
      if (response.success) {
        setSubscription(null);
        alert('Subscription cancelled successfully');
      } else {
        setError(response.error || 'Failed to cancel subscription');
      }
    } finally {
      setCancelling(false);
    }
  };

  if (!user || user.id === 'candidate') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
        <p className="text-blue-700">You must be a business owner to manage billing.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading subscription...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
          <p className="mt-2 text-gray-600">No active subscription</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-700 mb-4">
            Get started by choosing a plan that fits your needs.
          </p>
          <Link
            href="/billing/plans"
            className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
        <p className="mt-2 text-gray-600">Manage your current subscription</p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {subscription.planType}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {subscription.status}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Price</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${(subscription.priceInCents / 100).toFixed(2)}/month
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Started</p>
              <p className="text-lg text-gray-900 mt-1">
                {new Date(subscription.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {subscription.nextBillingDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">Next Billing Date</p>
              <p className="text-lg text-gray-900 mt-1">
                {new Date(subscription.nextBillingDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="border-t pt-6 space-y-3">
            <Link
              href="/billing/plans"
              className="block w-full text-center py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Change Plan
            </Link>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/billing/entitlements"
          className="text-blue-600 hover:text-blue-700"
        >
          View your entitlements and usage limits →
        </Link>
      </div>
    </div>
  );
}
