'use client';

import { useState, useEffect } from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { apiRequest } from '@/lib/api/client';
import { Badge } from '@/components/ui/Badge';
import CandidateApplicationView from '@/components/business/CandidateApplicationView';

type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'PreHireChecks' | 'Hired' | 'Rejected';

interface PipelineApplication {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
}

interface Job {
  id: string;
  title: string;
}

export default function PipelinePage() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['BusinessOwner', 'Staff']}>
        <PipelineContent />
      </RequireRole>
    </RequireAuth>
  );
}

function PipelineContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<PipelineApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingAppId, setMovingAppId] = useState<string | null>(null);
  const [showPreHireModal, setShowPreHireModal] = useState(false);
  const [selectedAppToHire, setSelectedAppToHire] = useState<PipelineApplication | null>(null);
  const [selectedAppToView, setSelectedAppToView] = useState<PipelineApplication | null>(null);
  const [preHireNotes, setPreHireNotes] = useState('');
  const [preHireConfirmed, setPreHireConfirmed] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const statuses: ApplicationStatus[] = ['Applied', 'Screening', 'Interview', 'PreHireChecks', 'Hired', 'Rejected'];

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await apiRequest<any>('/api/jobs/organization');
        if (response.success && response.data) {
          const jobsList = response.data.items || response.data;
          setJobs(jobsList);
          if (jobsList.length > 0 && !selectedJobId) {
            setSelectedJobId(jobsList[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applications when job selected
  useEffect(() => {
    if (!selectedJobId) return;

    const fetchApplications = async () => {
      try {
        const res = await apiRequest<{ stages: { [key: string]: PipelineApplication[] } }>(`/api/pipeline/jobs/${selectedJobId}`);
        if (res.success && res.data) {
          // Convert stages dictionary to flat array of applications
          const allApps: PipelineApplication[] = [];
          if (res.data.stages) {
            Object.values(res.data.stages).forEach(stageApps => {
              allApps.push(...stageApps);
            });
          }
          setApplications(allApps);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    };

    fetchApplications();
  }, [selectedJobId]);

  const handleMoveApplication = async (appId: string, newStatus: ApplicationStatus) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    // If moving to Hired, show pre-hire modal
    if (newStatus === 'Hired') {
      setSelectedAppToHire(app);
      setShowPreHireModal(true);
      return;
    }

    // Otherwise, move directly
    await moveApplication(appId, newStatus);
  };

  const moveApplication = async (appId: string, newStatus: ApplicationStatus, notes?: string, preHireCheckConfirmation?: boolean) => {
    setMovingAppId(appId);
    try {
      const res = await apiRequest(`/api/pipeline/applications/${appId}/move`, {
        method: 'POST',
        body: JSON.stringify({
          ToStatus: newStatus,
          Notes: notes,
          PreHireCheckConfirmation: preHireCheckConfirmation
        })
      });

      if (res.success) {
        // Refresh applications
        if (selectedJobId) {
          const refreshResponse = await apiRequest<{ items: PipelineApplication[] }>(`/api/pipeline/jobs/${selectedJobId}`);
          if (refreshResponse.success && refreshResponse.data) {
            const appsList = refreshResponse.data.items || [];
            setApplications(Array.isArray(appsList) ? appsList : []);
          }
        }
      } else {
        alert('Failed to move application');
      }
    } catch (error) {
      console.error('Error moving application:', error);
      alert('Failed to move application');
    } finally {
      setMovingAppId(null);
    }
  };

  const handlePreHireSubmit = async () => {
    if (!selectedAppToHire) return;
    if (!preHireConfirmed || confirmText.toUpperCase() !== 'CONFIRM') {
      alert('Please confirm pre-hire checks and type CONFIRM');
      return;
    }
    if (!preHireNotes.trim()) {
      alert('Please provide notes');
      return;
    }

    await moveApplication(selectedAppToHire.id, 'Hired', preHireNotes, true);

    // Close modal and reset
    setShowPreHireModal(false);
    setSelectedAppToHire(null);
    setPreHireNotes('');
    setPreHireConfirmed(false);
    setConfirmText('');
  };

  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Screening': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Interview': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'PreHireChecks': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Hired': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <PageHeader title="Recruitment Pipeline" description="No jobs found" />
          <EmptyState
            icon="💼"
            title="No Jobs Yet"
            description="Post your first job to start building your candidate pipeline"
            action={{ label: 'Post a Job', href: '/business/jobs/new' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Recruitment Pipeline"
          description="Manage candidates through your hiring process"
          backLink={{ href: '/business', label: 'Back to Dashboard' }}
        />

        {/* Job Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Job</label>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Pipeline Columns */}
        {applications.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No Applications Yet"
            description="Candidates will appear here once they apply to this job"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statuses.filter(s => s !== 'Rejected').map(status => {
              const appsInStatus = applications.filter(app => app.status === status);
              return (
                <div key={status} className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-lg text-[var(--brand-navy)] mb-4 flex items-center gap-2">
                    {status}
                    <span className="text-sm font-normal bg-gray-100 px-2 py-1 rounded-full">
                      {appsInStatus.length}
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {appsInStatus.map(app => (
                      <div key={app.id} className={`p-4 rounded-lg border-2 ${getStatusColor(app.status)}`}>
                        <p className="font-semibold text-gray-900">{app.candidateName}</p>
                        <p className="text-sm text-gray-600 mb-2">{app.candidateEmail}</p>
                        <p className="text-xs text-gray-500 mb-3">
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </p>

                        {/* Move Actions */}
                        {movingAppId === app.id ? (
                          <p className="text-xs text-gray-500">Moving...</p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs h-8"
                              onClick={() => setSelectedAppToView(app)}
                            >
                              View Profile & Map
                            </Button>
                            <select
                              onChange={(e) => handleMoveApplication(app.id, e.target.value as ApplicationStatus)}
                              className="text-xs px-2 py-1 border rounded w-full"
                              defaultValue=""
                            >
                              <option value="" disabled>Move to...</option>
                              {statuses.filter(s => s !== app.status).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Rejected Section */}
        {applications.some(app => app.status === 'Rejected') && (
          <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Rejected ({applications.filter(app => app.status === 'Rejected').length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {applications.filter(app => app.status === 'Rejected').map(app => (
                <div key={app.id} className="p-3 rounded-lg border bg-gray-50 text-sm">
                  <p className="font-semibold">{app.candidateName}</p>
                  <p className="text-xs text-gray-500">{app.candidateEmail}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pre-Hire Modal */}
        {showPreHireModal && selectedAppToHire && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-4">
                Pre-Hire Confirmation Required
              </h3>
              <p className="text-gray-700 mb-4">
                You are about to mark <strong>{selectedAppToHire.candidateName}</strong> as Hired.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pre-Hire Notes (Required)
                </label>
                <textarea
                  value={preHireNotes}
                  onChange={(e) => setPreHireNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
                  rows={4}
                  placeholder="Document what pre-hire checks were completed (e.g., references, background check, ID verification)..."
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preHireConfirmed}
                    onChange={(e) => setPreHireConfirmed(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that all required pre-hire checks have been completed
                  </span>
                </label>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type CONFIRM to proceed
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Type CONFIRM"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setShowPreHireModal(false);
                    setSelectedAppToHire(null);
                    setPreHireNotes('');
                    setPreHireConfirmed(false);
                    setConfirmText('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-green-600"
                  onClick={handlePreHireSubmit}
                  disabled={!preHireConfirmed || confirmText.toUpperCase() !== 'CONFIRM' || !preHireNotes.trim()}
                >
                  Confirm Hire
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Candidate View Modal */}
        {selectedAppToView && (
          <CandidateApplicationView
            applicationId={selectedAppToView.id}
            candidateName={selectedAppToView.candidateName}
            jobId={selectedJobId || undefined}
            onClose={() => setSelectedAppToView(null)}
          />
        )}
      </div>
    </div>
  );
}
