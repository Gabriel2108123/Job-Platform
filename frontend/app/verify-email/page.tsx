'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { apiFetch } from '@/lib/api/client';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError('No verification token provided');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          { method: 'POST', body: JSON.stringify({}) }
        );

        if (response.success) {
          setSuccess(true);
        } else {
          setError(response.error?.message || 'Failed to verify email');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <Card variant="default">
          <CardBody>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                <p className="mt-4 text-gray-600">Verifying your email...</p>
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <h1 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">
                  Email Verified!
                </h1>
                <p className="text-gray-600 mb-6">
                  Your email has been successfully verified. You can now apply for jobs.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/jobs">
                    <Button variant="default" className="w-full">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 text-red-600">✕</div>
                <h1 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">
                  Verification Failed
                </h1>
                <p className="text-gray-600 mb-6">{error || 'Unable to verify your email.'}</p>
                <div className="flex flex-col gap-3">
                  <Link href="/jobs">
                    <Button variant="default" className="w-full">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
