'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { getMyApplications, getApplicationHistory, withdrawApplication, ApplicationDto, ApplicationHistoryEntry, ApplicationStatus } from '@/lib/api/client';

export default function ApplicationsPage() {
  return (
    <RequireAuth>
      <ApplicationsContent />
    </RequireAuth>
  );
}

function ApplicationsContent() {
  const [applications, setApplications] = useState<ApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<ApplicationHistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [withdrawConfirm, setWithdrawConfirm] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Fetch applications on mount
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getMyApplications();
        if (response.success && response.data) {
          setApplications(response.data);
        } else {
          setError(response.error || 'Failed to load applications');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Fetch history when modal opens
  useEffect(() => {
    if (!selectedApplicationId) {
      setHistory([]);
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const response = await getApplicationHistory(selectedApplicationId);
        if (response.success && response.data) {
          setHistory(response.data);
        } else {
          setHistoryError(response.error || 'Failed to load history');
        }
      } catch (err) {
        setHistoryError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [selectedApplicationId]);

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawing(true);
    setWithdrawError(null);
    try {
      const response = await withdrawApplication(applicationId);
      if (response.success) {
        // Remove application from list
        setApplications(applications.filter(app => app.id !== applicationId));
        setWithdrawConfirm(null);
      } else {
        setWithdrawError(response.error || 'Failed to withdraw application');
      }
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Applied:
        return 'bg-blue-100 text-blue-800';
      case ApplicationStatus.Screening:
        return 'bg-purple-100 text-purple-800';
      case ApplicationStatus.Interview:
        return 'bg-indigo-100 text-indigo-800';
      case ApplicationStatus.PreHireChecks:
        return 'bg-yellow-100 text-yellow-800';
      case ApplicationStatus.Hired:
        return 'bg-emerald-100 text-emerald-800';
      case ApplicationStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case ApplicationStatus.Withdrawn:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.Applied:
        return 'Applied';
      case ApplicationStatus.Screening:
        return 'Screening';
      case ApplicationStatus.Interview:
        return 'Interview';
      case ApplicationStatus.PreHireChecks:
        return 'Pre-Hire Checks';
      case ApplicationStatus.Hired:
        return 'Hired';
      case ApplicationStatus.Rejected:
        return 'Rejected';
      case ApplicationStatus.Withdrawn:
        return 'Withdrawn';
      default:
        return 'Unknown';
    }
  };

  const canWithdraw = (status: ApplicationStatus) => {
    return status !== ApplicationStatus.Withdrawn && 
           status !== ApplicationStatus.Rejected && 
           status !== ApplicationStatus.Hired;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/jobs" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
            ← Back to Browse Jobs
          </Link>
          <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">My Applications</h1>
          <p className="text-gray-600">Track your job applications and their status</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading your applications...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && !error && (
          <Card variant="default">
            <CardBody className="text-center py-12">
              <p className="text-gray-600 mb-6">You haven't applied to any jobs yet</p>
              <Link href="/jobs">
                <Button variant="primary">Browse Jobs</Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {/* Applications Grid */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <Card key={app.id} variant="default" className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[var(--brand-navy)] line-clamp-2">
                        {app.jobId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getStatusColor(app.currentStatus)}>
                      {getStatusLabel(app.currentStatus)}
                    </Badge>
                  </div>

                  {/* Status Timeline Preview */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Current Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]"></div>
                      <p className="text-sm font-medium text-gray-900">
                        {getStatusLabel(app.currentStatus)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedApplicationId(app.id)}
                        variant="primary"
                        className="flex-1 text-sm"
                      >
                        View Timeline
                      </Button>
                      <Link href={`/jobs/${app.jobId}`} className="flex-1">
                        <Button variant="outline" className="w-full text-sm">
                          View Job
                        </Button>
                      </Link>
                    </div>
                    {canWithdraw(app.currentStatus) && (
                      <Button
                        onClick={() => setWithdrawConfirm(app.id)}
                        variant="outline"
                        className="w-full text-sm text-red-600 hover:text-red-700 border-red-200"
                      >
                        Withdraw Application
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* History Modal */}
      {selectedApplicationId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card variant="default" className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[var(--brand-navy)]">Application Timeline</h2>
                <button
                  onClick={() => setSelectedApplicationId(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                >
                  ✕
                </button>
              </div>

              {historyLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                  <p className="mt-4 text-gray-600">Loading timeline...</p>
                </div>
              ) : historyError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{historyError}</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No status changes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Timeline */}
                  {history.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {/* Timeline line */}
                      {index < history.length - 1 && (
                        <div className="absolute left-4 top-10 w-0.5 h-8 bg-gray-300"></div>
                      )}

                      {/* Timeline item */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          </div>
                        </div>
                        <div className="pb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className={getStatusColor(entry.newStatus)}>
                                {getStatusLabel(entry.newStatus)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {new Date(entry.changedAt).toLocaleDateString()} at{' '}
                                {new Date(entry.changedAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {entry.reason && (
                              <p className="text-sm text-gray-700">{entry.reason}</p>
                            )}
                            {entry.changedBy && (
                              <p className="text-xs text-gray-500 mt-2">By: {entry.changedBy}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => setSelectedApplicationId(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {withdrawConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card variant="default" className="w-full max-w-md">
            <CardBody>
              <h2 className="text-xl font-bold text-[var(--brand-navy)] mb-4">Withdraw Application?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to withdraw this application? This action cannot be undone.
              </p>
              {withdrawError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-800 text-sm">{withdrawError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={() => setWithdrawConfirm(null)}
                  variant="outline"
                  className="flex-1"
                  disabled={withdrawing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleWithdraw(withdrawConfirm)}
                  variant="primary"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={withdrawing}
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
