'use client';

import { useState, useEffect } from 'react';
import { isLoggedIn, isEmailVerified } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { authApi } from '@/lib/api/auth';

interface RequireVerifiedEmailProps {
  children: React.ReactNode;
}

export function RequireVerifiedEmail({ children }: RequireVerifiedEmailProps) {
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isLoggedIn() && isEmailVerified()) {
      setVerified(true);
    }
  }, []);

  const handleSendVerification = async () => {
    setSending(true);
    try {
      await authApi.sendVerification();
      setSent(true);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setSending(false);
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card variant="default" className="max-w-md w-full">
          <CardBody>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--brand-navy)] mb-2">
                Email Verification Required
              </h2>
              <p className="text-gray-600 mb-6">
                You need to verify your email address before accessing this feature.
              </p>
              {sent ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">
                    Verification email sent! Check your inbox and click the link to verify your account.
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleSendVerification}
                  disabled={sending}
                  variant="primary"
                  className="w-full"
                >
                  {sending ? 'Sending...' : 'Send Verification Email'}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
