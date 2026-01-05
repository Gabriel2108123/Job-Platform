'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from '@/lib/types/auth';
import { getEntitlements, EntitlementLimit } from '@/lib/api/entitlements';

interface EntitlementsPageProps {
  user: User | null;
  organizationId: string;
}

const LIMIT_LABELS: Record<string, string> = {
  JobsPostingLimit: 'Job Postings',
  CandidateSearchLimit: 'Candidate Searches',
  StaffSeats: 'Staff Members',
};

const LIMIT_DESCRIPTIONS: Record<string, string> = {
  JobsPostingLimit: 'Number of active job postings you can have',
  CandidateSearchLimit: 'Monthly candidate search limit',
  StaffSeats: 'Number of team members with access',
};

export default function EntitlementsPage({ user, organizationId }: EntitlementsPageProps) {
  const [entitlements, setEntitlements] = useState<EntitlementLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntitlements = async () => {
      setLoading(true);
      const response = await getEntitlements(organizationId);
      if (response.success && response.data) {
        setEntitlements(response.data);
      } else {
        setError(response.error || 'Failed to load entitlements');
      }
      setLoading(false);
    };

    fetchEntitlements();
  }, [organizationId]);

  if (!user || user.id === 'candidate') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
        <p className="text-blue-700">You must be a business owner to view entitlements.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading entitlements...</div>
      </div>
    );
  }

  if (entitlements.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usage & Entitlements</h1>
          <p className="mt-2 text-gray-600">No entitlements available</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-700 mb-4">Subscribe to a plan to see your usage limits.</p>
          <Link
            href="/billing/plans"
            className="inline-block py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Choose Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usage & Entitlements</h1>
        <p className="mt-2 text-gray-600">
          View your current plan limits and usage across features
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-blue-700 text-sm">
          <strong>Plan:</strong> {entitlements[0]?.planType || 'Unknown'}
        </p>
      </div>

      <div className="space-y-6">
        {entitlements.map((limit) => {
          const usagePercent = (limit.currentUsage / limit.maxLimit) * 100;
          const isNearLimit = usagePercent >= 80;
          const isAtLimit = usagePercent >= 100;

          return (
            <div
              key={limit.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {LIMIT_LABELS[limit.limitType] || limit.limitType}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {LIMIT_DESCRIPTIONS[limit.limitType] || ''}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Used</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {limit.currentUsage}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Limit</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {limit.maxLimit === 999999 ? '∞' : limit.maxLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Remaining</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {limit.maxLimit === 999999 ? '∞' : limit.remainingLimit}
                    </p>
                  </div>
                </div>

                {limit.maxLimit !== 999999 && (
                  <div className="space-y-2">
                    <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isAtLimit
                            ? 'bg-red-600'
                            : isNearLimit
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usagePercent, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600">
                      {usagePercent.toFixed(0)}% of limit used
                    </p>
                  </div>
                )}

                {isAtLimit && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3">
                    <p className="text-red-700 text-sm font-medium">
                      You have reached your limit for this feature.
                    </p>
                  </div>
                )}

                {isNearLimit && !isAtLimit && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                    <p className="text-yellow-700 text-sm font-medium">
                      You are approaching your limit. Consider upgrading your plan.
                    </p>
                  </div>
                )}

                {limit.resetDate && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">
                      Resets: {new Date(limit.resetDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <p className="text-blue-700 text-sm mb-2">
          Need more capacity? Upgrade your plan to unlock higher limits.
        </p>
        <Link
          href="/billing/plans"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View upgrade options →
        </Link>
      </div>

      <div className="border-t pt-6">
        <Link
          href="/billing/subscription"
          className="text-blue-600 hover:text-blue-700"
        >
          ← Back to subscription
        </Link>
      </div>
    </div>
  );
}
