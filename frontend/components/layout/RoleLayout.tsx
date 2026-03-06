'use client';

import React from 'react';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { AppShell } from './AppShell';
import { getNavigationForUser } from '@/config/navigation';
import { Role } from '@/lib/roles';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';

interface RoleLayoutProps {
    children: React.ReactNode;
    pageTitle?: string;
    pageActions?: React.ReactNode;
    rightPanel?: React.ReactNode;
}

export function RoleLayout({
    children,
    pageTitle,
    pageActions,
    rightPanel
}: RoleLayoutProps) {
    const { role, loading: roleLoading } = useUserRole();
    const { permissions, loading: permLoading } = usePermissions();
    const router = useRouter();

    React.useEffect(() => {
        if (!roleLoading && !role) {
            router.push(ROUTES.LOGIN);
        }
    }, [role, roleLoading, router]);

    if (roleLoading || permLoading || !role) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">
                        Configuring your workspace...
                    </p>
                </div>
            </div>
        );
    }

    // Get navigation based on role and permissions
    const navItems = getNavigationForUser(role as Role, permissions);

    // Custom mobile nav logic - can be refined per role
    const mobileNavItems = navItems.filter((item: any) =>
        ['Dashboard', 'Jobs', 'Applications', 'Messages', 'Profile', 'Tickets', 'Inbox'].includes(item.label)
    );

    return (
        <AppShell
            role={(role as Role) || 'Candidate'}
            navItems={navItems}
            mobileNavItems={mobileNavItems}
            pageTitle={pageTitle}
            pageActions={pageActions}
            rightPanel={rightPanel}
        >
            {children}
        </AppShell>
    );
}
