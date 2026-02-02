'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getOrganizationJobs, JobDto, EmploymentType, JobStatus } from '@/lib/api/client';
import { getOrganizationId } from '@/lib/auth-helpers';

export default function BusinessJobsPage() {
  const [jobs, setJobs] = useState<JobDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const organizationId = getOrganizationId();

  useEffect(() => {
    if (!organizationId) {
      setError('No organization found. Please ensure you are logged in as a business user.');
      setLoading(false);
      return;
    }

    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getOrganizationJobs(organizationId);
        if (response.success && response.data) {
          // Handle both array and PagedResult
          const items = Array.isArray(response.data) ? response.data : (response.data as any).items || [];
          setJobs(items);
        } else {
          setError(response.error || 'Failed to load jobs');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [organizationId]);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.Published:
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case JobStatus.Draft:
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case JobStatus.Closed:
        return <Badge className="bg-red-100 text-red-800">Closed</Badge>;
      case JobStatus.Filled:
        return <Badge className="bg-blue-100 text-blue-800">Filled</Badge>;
      case JobStatus.Cancelled:
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getEmploymentTypeLabel = (type: EmploymentType) => {
    switch (type) {
      case EmploymentType.FullTime:
        return 'Full-time';
      case EmploymentType.PartTime:
        return 'Part-time';
      case EmploymentType.Casual:
        return 'Casual';
      case EmploymentType.Temporary:
        return 'Temporary';
      case EmploymentType.Contract:
        return 'Contract';
      case EmploymentType.ZeroHours:
        return 'Zero Hours';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/business" className="text-[var(--brand-primary)] hover:underline mb-4 inline-block">
              ← Back to Business Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">Your Job Postings</h1>
            <p className="text-gray-600">Manage your organization's job listings</p>
          </div>
          <Link href="/business/jobs/new">
            <Button variant="primary" className="bg-[var(--brand-primary)]">
              + Create New Job
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading your jobs...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && !error && (
          <Card variant="default">
            <CardBody className="text-center py-12">
              <p className="text-gray-600 mb-6">You haven't created any jobs yet</p>
              <Link href="/business/jobs/new">
                <Button variant="primary">Create Your First Job</Button>
              </Link>
            </CardBody>
          </Card>
        )}

        {/* Jobs List */}
        {!loading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} variant="default" className="hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-[var(--brand-navy)] mb-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-sm text-gray-600">
                          📍 {job.location}
                        </span>
                        <span className="text-sm text-gray-600">
                          🕐 {getEmploymentTypeLabel(job.employmentType)}
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="text-sm text-gray-600">
                            💷 {job.salaryMin && job.salaryMax ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}` : job.salaryMin?.toLocaleString() || job.salaryMax?.toLocaleString()} {job.salaryCurrency || 'GBP'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {getStatusBadge(job.status)}
                      <span className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link href={`/business/jobs/${job.id}/pipeline`} className="flex-1">
                      <Button variant="primary" className="w-full text-sm">
                        View Pipeline
                      </Button>
                    </Link>
                    <Link href={`/business/jobs/${job.id}/edit`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/business/jobs/${job.id}/discovery`} className="flex-1">
                      <Button variant="secondary" className="w-full text-sm bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200">
                        Find Workers
                      </Button>
                    </Link>
                    {job.status === JobStatus.Draft && (
                      <Button
                        variant="secondary"
                        className="flex-1 w-full text-sm bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!confirm('Are you sure you want to publish this job?')) return;

                          // Inline publish logic since we need to refresh or update state
                          try {
                            const { apiRequest } = await import('@/lib/api/client');
                            const res = await apiRequest(`/api/jobs/${job.id}/publish`, { method: 'POST' });
                            if (res.success) {
                              // Refresh jobs
                              if (!organizationId) return;
                              const response = await getOrganizationJobs(organizationId);
                              if (response.success && response.data) {
                                // Handle both array and PagedResult
                                const items = Array.isArray(response.data) ? response.data : (response.data as any).items || [];
                                setJobs(items);
                              }
                            } else {
                              alert('Failed to publish: ' + (res.error || 'Unknown error'));
                            }
                          } catch (err) {
                            console.error(err);
                            alert('An error occurred');
                          }
                        }}
                      >
                        Publish
                      </Button>
                    )}
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        Preview
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
