/**
 * Role-specific dashboard section component
 */

'use client';

import Link from 'next/link';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/roles';

interface DashboardStats {
  label: string;
  value: string | number;
  icon: string;
  href?: string;
}

export function RoleDashboardSection() {
  const { role, features, navigationLinks, loading } = useUserRole();

  if (loading || !role) return null;

  // Define stats per role
  const statsMap: Record<string, DashboardStats[]> = {
    [ROLES.Candidate]: [
      { label: 'Jobs Applied', value: 0, icon: '📄', href: '/applications' },
      { label: 'Interviews', value: 0, icon: '📞', href: '/applications' },
      { label: 'Offers', value: 0, icon: '🎉', href: '/applications' },
      { label: 'Saved Jobs', value: 0, icon: '💾', href: '/jobs' },
    ],
    [ROLES.BusinessOwner]: [
      { label: 'Active Jobs', value: 0, icon: '📋', href: '/business/jobs' },
      { label: 'Open Applications', value: 0, icon: '📥', href: '/business/pipeline' },
      { label: 'Team Members', value: 0, icon: '👥', href: '/business/team' },
      { label: 'Pipeline Stage', value: '—', icon: '📊', href: '/business/pipeline' },
    ],
    [ROLES.Staff]: [
      { label: 'Job Posts', value: 0, icon: '📋', href: '/business/jobs' },
      { label: 'Applications', value: 0, icon: '📥', href: '/business/pipeline' },
      { label: 'Team Size', value: 0, icon: '👥', href: '/business/team' },
      { label: 'Messages', value: 0, icon: '💬', href: '/messages' },
    ],
    [ROLES.Support]: [
      { label: 'Open Tickets', value: 0, icon: '🎫', href: '/support/tickets' },
      { label: 'Resolved', value: 0, icon: '✅', href: '/support/tickets' },
      { label: 'Response Time', value: '—', icon: '⏱️', href: '/support' },
      { label: 'Satisfaction', value: '—', icon: '⭐', href: '/support' },
    ],
    [ROLES.Admin]: [
      { label: 'Total Users', value: 0, icon: '👥', href: '/admin/users' },
      { label: 'Organizations', value: 0, icon: '🏢', href: '/admin/organizations' },
      { label: 'Active Jobs', value: 0, icon: '📋', href: '/admin' },
      { label: 'Support Tickets', value: 0, icon: '🎫', href: '/admin/support' },
    ],
  };

  const stats = statsMap[role] || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Link key={idx} href={stat.href || '#'}>
            <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 cursor-pointer">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-[var(--brand-primary)]">{stat.value}</div>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {navigationLinks.slice(0, 4).map((link, idx) => (
            <Link key={idx} href={link.href}>
              <Button variant="outline" className="w-full text-center justify-center text-sm">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Available Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
              <div className="w-2 h-2 bg-[var(--brand-primary)] rounded-full"></div>
              <span className="text-gray-700">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
