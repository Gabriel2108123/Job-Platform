'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { ROLES } from '@/lib/roles';
import { ROUTES } from '@/config/routes';

/**
 * Generic dashboard redirector.
 * Redirects users to their role-specific home page.
 */
export default function DashboardRedirectPage() {
    const router = useRouter();
    const { role, loading } = useUserRole();

    useEffect(() => {
        if (loading) return;

        if (!role) {
            router.push(ROUTES.LOGIN);
            return;
        }

        switch (role) {
            case ROLES.Candidate:
                router.push(ROUTES.CANDIDATE.HOME);
                break;
            case ROLES.BusinessOwner:
            case ROLES.Staff:
                router.push(ROUTES.BUSINESS.HOME);
                break;
            case ROLES.Admin:
                router.push(ROUTES.ADMIN.HOME);
                break;
            case ROLES.Support:
                router.push(ROUTES.SUPPORT.HOME);
                break;
            default:
                router.push(ROUTES.HOME);
        }
    }, [role, loading, router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-slate-500">
                    Redirecting to your workspace...
                </p>
            </div>
        </div>
    );
}
