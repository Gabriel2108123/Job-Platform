/**
 * Role-based access control wrapper
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import type { Role } from '@/lib/roles';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: Role[];
  fallback?: ReactNode;
}

/**
 * Component to restrict access to certain roles
 */
export function RequireRole({ children, allowedRoles, fallback }: RequireRoleProps) {
  const { role, loading } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (!loading && role && !allowedRoles.includes(role)) {
      router.replace('/');
    }
  }, [loading, role, allowedRoles, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (role && !allowedRoles.includes(role)) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      )
    );
  }

  return children;
}

interface RoleBasedRenderProps<T extends Role = Role> {
  children: (role: T) => ReactNode;
  defaultFallback?: ReactNode;
}

/**
 * Component for role-based rendering
 */
export function RoleBasedRender({ children, defaultFallback }: RoleBasedRenderProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return null;
  }

  if (!role) {
    return defaultFallback || null;
  }

  return children(role as Role);
}
