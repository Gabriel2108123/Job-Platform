'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/auth';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check auth only on client side after mount
    if (!isLoggedIn()) {
      router.push(redirectTo);
    } else {
      setAuthorized(true);
    }
    setChecking(false);
  }, [router, redirectTo]);

  // Show loading state while checking or if not authorized (redirecting)
  if (checking || !authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
