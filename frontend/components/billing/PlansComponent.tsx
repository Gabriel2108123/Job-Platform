'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User, UserRole } from '@/lib/types/auth';
import { getPlans, createSubscription, Plan } from '@/lib/api/billing';

interface PlansPageProps {
  user: User | null;
  organizationId: string;
}

export default function PlansPage({ user, organizationId }: PlansPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const response = await getPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      } else {
        setError(response.error || 'Failed to load plans');
      }
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (planType: string) => {
    setSubscribing(planType);
    setError(null);

    try {
      const response = await createSubscription({
        organizationId,
        planType,
        stripePaymentMethodId: 'pm_test_placeholder', // In production, use Stripe payment method
      });

      if (response.success) {
        // Redirect to subscription management page
        window.location.href = `/billing/subscription`;
      } else {
        setError(response.error || 'Failed to create subscription');
      }
    } finally {
      setSubscribing(null);
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
        <div className="text-gray-500">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="mt-2 text-gray-600">
          Select the plan that best fits your hiring needs
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-3xl font-bold text-gray-900">
                  ${(plan.priceInCents / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">/month</p>
              </div>

              <button
                onClick={() => handleSubscribe(plan.planType)}
                disabled={subscribing === plan.planType}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {subscribing === plan.planType ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href={`/billing/subscription`}
          className="text-blue-600 hover:text-blue-700"
        >
          Already have a subscription? View it here →
        </Link>
      </div>
    </div>
  );
}
