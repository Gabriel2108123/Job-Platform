'use client';

import React from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Role } from '@/lib/roles';

interface RoleGateProps {
    roles: Role[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Restricts UI sections based on the user's primary role.
 */
export function RoleGate({
    roles,
    children,
    fallback = null
}: RoleGateProps) {
    const { role, loading } = useUserRole();

    if (loading) return null;

    if (role && roles.includes(role as Role)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
