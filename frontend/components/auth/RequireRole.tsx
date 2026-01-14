'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getUser } from '@/lib/auth';

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

export function RequireRole({ children, allowedRoles, redirectTo = '/login' }: RequireRoleProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push(redirectTo);
      return;
    }

    const user = getUser();
    if (!user?.role || !allowedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [router, allowedRoles, redirectTo]);

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
      </div>
    );
  }

  const user = getUser();
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
