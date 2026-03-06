'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getUserPermissions } from '@/lib/auth-helpers';

/**
 * Custom hook for accessing user permissions.
 * Provides easy access to the current authenticated user's organization permissions.
 * 
 * @returns An object containing the permissions array and helpers to check specific permissions.
 */
export function usePermissions() {
    const [permissions, setPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const userPermissions = getUserPermissions();
        setPermissions(userPermissions);
        setLoading(false);
    }, [pathname]);

    const hasPermission = (permissionKey: string): boolean => {
        // admin.all overrides all other permissions
        if (permissions.includes('admin.all')) return true;
        return permissions.includes(permissionKey);
    };

    return {
        permissions,
        loading,
        hasPermission,
        // Pre-computed common checks
        canManageJobs: hasPermission('jobs.create') || hasPermission('jobs.publish') || hasPermission('jobs.close'),
        canManageApplications: hasPermission('applications.move') || hasPermission('applications.withdraw'),
        canSendMessages: hasPermission('messaging.send'),
        canManageBilling: hasPermission('org.billing'),
        canManageMembers: hasPermission('org.members.manage'),
    };
}
