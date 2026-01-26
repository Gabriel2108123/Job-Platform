/**
 * Custom hook for role-based operations
 */

'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getUserRole } from '@/lib/auth-helpers';
import {
  ROLES,
  type Role,
  ROLE_FEATURES,
  ROLE_NAVIGATION,
  hasFeature,
  canAccessPage,
  getRoleDisplayName,
  getRoleColor,
} from '@/lib/roles';

export function useUserRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const userRole = getUserRole() as Role | null;
    setRole(userRole);
    setLoading(false);
  }, [pathname]);

  return {
    role,
    loading,
    // Check if user has a specific role
    isCandidate: role === ROLES.Candidate,
    isBusinessOwner: role === ROLES.BusinessOwner,
    isStaff: role === ROLES.Staff,
    isSupport: role === ROLES.Support,
    isAdmin: role === ROLES.Admin,
    isBusinessUser: role === ROLES.BusinessOwner || role === ROLES.Staff,
    // Get role info
    displayName: getRoleDisplayName(role),
    color: getRoleColor(role),
    // Feature and page access
    features: role ? ROLE_FEATURES[role] : [],
    navigationLinks: role ? ROLE_NAVIGATION[role] : [],
    hasFeature: (featureName: string) => hasFeature(role, featureName),
    canAccessPage: (pathname: string) => canAccessPage(role, pathname),
  };
}
