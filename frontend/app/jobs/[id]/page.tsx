'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getJob, applyToJob, sendEmailVerification, JobDto } from '@/lib/api/client';
import { isLoggedIn, isEmailVerified, getUser } from '@/lib/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [jobId, setJobId] = useState<string>('');
  const [job, setJob] = useState<JobDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Get job ID from params
  useEffect(() => {
    params.then((resolved) => {
      setJobId(resolved.id);
    });
  }, [params]);

  // Fetch job details
  useEffect(() => {
    if (!jobId) return;

    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getJob(jobId);
        if (response.success && response.data) {
          setJob(response.data);
        } else {
          setError(response.error || 'Failed to load job');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleApply = async () => {
    setApplyLoading(true);
    setApplyError(null);
    setApplySuccess(false);

    try {
      const response = await applyToJob(jobId);
      if (response.success) {
        setApplySuccess(true);
        // Auto-scroll to success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // Check for specific error messages
        // Handle both 409 and 400 as "already applied"
        if ((response.error?.status === 409 || response.error?.status === 400) && 
            response.error?.message?.toLowerCase().includes('already')) {
          setApplyError('You already applied to this job');
        } else if (response.error?.status === 403) {
          setApplyError('Please verify your email before applying');
        } else {
          setApplyError(response.error?.message || 'Failed to apply to job');
        }
      }
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleSendVerification = async () => {
    setVerificationLoading(true);
    try {
      const response = await sendEmailVerification();
      if (response.success) {
        setVerificationSent(true);
      } else {
        setApplyError(response.error?.message || 'Failed to send verification email');
      }
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setVerificationLoading(false);
    }
  };

  const user = getUser();
  const loggedIn = isLoggedIn();
  const emailVerified = isEmailVerified();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">{error || 'Job not found'}</p>
            <Link href="/jobs">
              <Button variant="default">Back to Jobs</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {applySuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-800 font-semibold mb-2">Application Submitted!</p>
            <p className="text-green-700 mb-4">
              Your application has been successfully submitted. You can view your applications
              in your profile.
            </p>
            <div className="flex gap-3">
              <Link href="/jobs">
                <Button variant="default">Browse More Jobs</Button>
              </Link>
              <Link href="/applications">
                <Button variant="default">View My Applications</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Verification Required Banner */}
        {loggedIn && !emailVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <p className="text-yellow-800 font-semibold mb-2">Email Verification Required</p>
            <p className="text-yellow-700 mb-4">
              Please verify your email to apply for jobs. We sent a verification link to{' '}
              <strong>{user?.email}</strong>.
            </p>
            <div className="flex gap-3">
              <Button
                variant="default"
                onClick={handleSendVerification}
                disabled={verificationLoading || verificationSent}
              >
                {verificationSent ? 'Verification Email Sent' : 'Resend Verification Email'}
              </Button>
              <Link href="/verify-email">
                <Button variant="default">Verify Now</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Apply Error */}
        {applyError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800">{applyError}</p>
          </div>
        )}

        {/* Back Link */}
        <Link href="/jobs" className="text-[var(--brand-primary)] hover:underline mb-6 inline-block">
          ← Back to Jobs
        </Link>

        {/* Job Header Card */}
        <Card variant="default" className="mb-8">
          <CardBody>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-4xl font-bold text-[var(--brand-navy)] mb-2">{job.title}</h1>
                <p className="text-xl text-gray-600">{job.location}</p>
              </div>
              {job.isPublished && (
                <Badge className="bg-green-100 text-green-800">Published</Badge>
              )}
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 py-4 border-t border-b">
              <div>
                <p className="text-sm text-gray-600 mb-1">Employment Type</p>
                <p className="font-semibold text-gray-900">
                  {job.employmentType === 'FullTime'
                    ? 'Full Time'
                    : job.employmentType === 'PartTime'
                    ? 'Part Time'
                    : 'Temporary'}
                </p>
              </div>
              {job.shiftPattern && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Shift Pattern</p>
                  <p className="font-semibold text-gray-900">{job.shiftPattern}</p>
                </div>
              )}
              {job.salary && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Salary</p>
                  <p className="font-semibold text-[var(--brand-primary)]">{job.salary}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 mb-1">Posted</p>
                <p className="font-semibold text-gray-900">
                  {new Date(job.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Description */}
          <div className="lg:col-span-2">
            <Card variant="default">
              <CardBody>
                <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-4">
                  About This Role
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {job.description}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Apply Sidebar */}
          <div className="lg:col-span-1">
            <Card variant="default" className="sticky top-4">
              <CardBody>
                {applySuccess ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">✓</div>
                    <p className="font-semibold text-green-700 mb-4">Application Submitted!</p>
                    <Link href="/jobs">
                      <Button variant="default" className="w-full">
                        Browse More Jobs
                      </Button>
                    </Link>
                  </div>
                ) : !loggedIn ? (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">Sign in to apply for this job</p>
                    <Link href="/login">
                      <Button variant="default" className="w-full mb-2">
                        Login to Apply
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3">Don't have an account?</p>
                    <Link href="/register">
                      <Button variant="outline" className="w-full">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                ) : !emailVerified ? (
                  <div className="text-center">
                    <p className="text-yellow-700 font-semibold mb-4">Verify Your Email</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Please verify your email address before applying.
                    </p>
                    <Button
                      onClick={handleSendVerification}
                      disabled={verificationLoading || verificationSent}
                      className="w-full mb-2"
                      variant="default"
                    >
                      {verificationSent ? 'Email Sent' : 'Send Verification'}
                    </Button>
                    <Link href="/verify-email">
                      <Button variant="outline" className="w-full">
                        Verify Now
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4 text-sm">
                      Ready to apply? Click below to submit your application.
                    </p>
                    <Button
                      onClick={handleApply}
                      disabled={applyLoading}
                      className="w-full"
                      variant="default"
                    >
                      {applyLoading ? 'Submitting...' : 'Apply Now'}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
