'use client';

import React from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface PermissionGateProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * UI-level permission containment.
 * Only renders children if the user has the required permission.
 * NOTE: This is for UI gating only. Backend remains the source of truth for security.
 */
export function PermissionGate({
    permission,
    children,
    fallback = null
}: PermissionGateProps) {
    const { hasPermission, loading } = usePermissions();

    if (loading) return null;

    if (hasPermission(permission)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}
