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
import { InterviewModal } from '@/components/business/InterviewModal';
import { OfferModal } from '@/components/business/OfferModal';
import { Checkbox } from '@/components/ui';
import { Loader2, Send, Calendar, Banknote } from 'lucide-react';

type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'OfferSent' | 'PreHireChecks' | 'Hired' | 'Rejected';

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

  // Stage 3 states
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedAppForInterview, setSelectedAppForInterview] = useState<PipelineApplication | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedAppForOffer, setSelectedAppForOffer] = useState<PipelineApplication | null>(null);

  // Bulk selection
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  const statuses: ApplicationStatus[] = ['Applied', 'Screening', 'Interview', 'OfferSent', 'PreHireChecks', 'Hired', 'Rejected'];

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

    // If moving to Interview, show interview modal
    if (newStatus === 'Interview') {
      setSelectedAppForInterview(app);
      setShowInterviewModal(true);
      return;
    }

    // If moving to OfferSent, show offer modal
    if (newStatus === 'OfferSent') {
      setSelectedAppForOffer(app);
      setShowOfferModal(true);
      return;
    }

    // If moving to Hired, show pre-hire modal
    if (newStatus === 'Hired') {
      setSelectedAppToHire(app);
      setShowPreHireModal(true);
      return;
    }

    // Otherwise, move directly
    await moveApplication(appId, newStatus);
  };

  const handleScheduleInterview = async (data: any) => {
    if (!selectedAppForInterview) return;

    // 1. Create interview record
    const interviewRes = await apiRequest('/api/interviews/schedule', {
      method: 'POST',
      body: JSON.stringify({
        ApplicationId: selectedAppForInterview.id,
        ...data
      })
    });

    if (interviewRes.success) {
      // 2. Move application to Interview status
      await moveApplication(selectedAppForInterview.id, 'Interview');
    } else {
      alert('Failed to schedule interview');
    }
  };

  const handleSendOffer = async (data: any) => {
    if (!selectedAppForOffer) return;

    // 1. Create offer record
    const offerRes = await apiRequest('/api/offers', {
      method: 'POST',
      body: JSON.stringify({
        ApplicationId: selectedAppForOffer.id,
        ...data
      })
    });

    if (offerRes.success) {
      // 2. Move application to OfferSent status
      await moveApplication(selectedAppForOffer.id, 'OfferSent');
    } else {
      alert('Failed to send offer');
    }
  };

  const toggleAppSelection = (appId: string) => {
    setSelectedAppIds(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleBulkMove = async (toStatus: ApplicationStatus) => {
    if (selectedAppIds.length === 0) return;

    if (confirm(`Are you sure you want to move ${selectedAppIds.length} candidates to ${toStatus}?`)) {
      setLoading(true);
      try {
        const res = await apiRequest('/api/pipeline/move-bulk', {
          method: 'POST',
          body: JSON.stringify({
            ApplicationIds: selectedAppIds,
            ToStatus: toStatus
          })
        });

        if (res.success) {
          // Refresh
          setSelectedAppIds([]);
          if (selectedJobId) {
            const refreshRes = await apiRequest<{ stages: { [key: string]: PipelineApplication[] } }>(`/api/pipeline/jobs/${selectedJobId}`);
            if (refreshRes.success && refreshRes.data) {
              const allApps: PipelineApplication[] = [];
              Object.values(refreshRes.data.stages).forEach(stageApps => allApps.push(...stageApps));
              setApplications(allApps);
            }
          }
        }
      } catch (error) {
        console.error('Bulk move failed:', error);
      } finally {
        setLoading(false);
      }
    }
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
      case 'Interview': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'OfferSent': return 'bg-green-50 text-green-700 border-green-200';
      case 'PreHireChecks': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Hired': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
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
            className="w-full md:w-96 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
          >
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedAppIds.length > 0 && (
          <div className="mb-6 bg-[var(--brand-navy)] text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <Badge variant="info" className="bg-white/10 text-white border-white/20">
                {selectedAppIds.length} Selected
              </Badge>
              <p className="text-sm font-medium">Bulk Actions:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.filter(s => s !== 'Rejected' && s !== 'Applied').map(status => (
                <Button
                  key={status}
                  size="sm"
                  variant="secondary"
                  className="text-xs py-1"
                  onClick={() => handleBulkMove(status)}
                >
                  Move to {status}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="text-xs py-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                onClick={() => handleBulkMove('Rejected')}
              >
                Reject All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs py-1 text-white/60 hover:text-white"
                onClick={() => setSelectedAppIds([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

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
                      <div key={app.id} className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md ${getStatusColor(app.status)}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 leading-tight">{app.candidateName}</p>
                            <p className="text-xs opacity-70 mt-0.5">{app.candidateEmail}</p>
                          </div>
                          <Checkbox
                            checked={selectedAppIds.includes(app.id)}
                            onChange={() => toggleAppSelection(app.id)}
                            className="mt-0.5"
                          />
                        </div>

                        <div className="flex items-center gap-2 text-[10px] opacity-60 font-medium mb-3">
                          <Calendar className="h-3 w-3" />
                          Applied: {new Date(app.appliedDate).toLocaleDateString()}
                        </div>

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
                              className="text-xs px-2 py-1 bg-white text-gray-900 border rounded w-full"
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
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent"
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
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg"
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

        {/* Stage 3 Modals */}
        <InterviewModal
          open={showInterviewModal}
          candidateName={selectedAppForInterview?.candidateName || ''}
          onClose={() => {
            setShowInterviewModal(false);
            setSelectedAppForInterview(null);
          }}
          onConfirm={handleScheduleInterview}
        />

        <OfferModal
          open={showOfferModal}
          candidateName={selectedAppForOffer?.candidateName || ''}
          onClose={() => {
            setShowOfferModal(false);
            setSelectedAppForOffer(null);
          }}
          onConfirm={handleSendOffer}
        />
      </div>
    </div>
  );
}
