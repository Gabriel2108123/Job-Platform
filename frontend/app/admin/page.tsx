'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RequireRole';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { apiRequest } from '@/lib/api/client';

export default function AdminDashboard() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['Admin']}>
        <AdminDashboardContent />
      </RequireRole>
    </RequireAuth>
  );
}

function AdminDashboardContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrgs: 0,
    activeSubscriptions: 0,
    waitlistCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        // Fetch users count
        const usersResponse = await apiRequest<any>('/api/admin/users?pageNumber=1&pageSize=1');
        if (usersResponse.success && usersResponse.data) {
          const totalCount = usersResponse.data.totalCount || usersResponse.data.items?.length || 0;
          setStats(prev => ({ ...prev, totalUsers: totalCount }));
        }

        // Fetch organizations count
        const orgsResponse = await apiRequest<any>('/api/admin/organizations?pageNumber=1&pageSize=1');
        if (orgsResponse.success && orgsResponse.data) {
          const totalCount = orgsResponse.data.totalCount || orgsResponse.data.items?.length || 0;
          setStats(prev => ({ ...prev, totalOrgs: totalCount }));
        }

        // Fetch subscriptions
        const subsResponse = await apiRequest<any>('/api/admin/subscriptions');
        if (subsResponse.success && subsResponse.data) {
          const subs = subsResponse.data.items || subsResponse.data || [];
          const active = subs.filter((s: any) => s.status === 'Active').length;
          setStats(prev => ({ ...prev, activeSubscriptions: active }));
        }

        // Fetch waitlist count
        const waitlistResponse = await apiRequest<any>('/api/waitlist');
        if (waitlistResponse.success && waitlistResponse.data) {
          const entries = Array.isArray(waitlistResponse.data) ? waitlistResponse.data : waitlistResponse.data.items || [];
          setStats(prev => ({ ...prev, waitlistCount: entries.length }));
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Admin Dashboard"
          description="Platform administration and management"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Users"
            value={loading ? '—' : stats.totalUsers.toString()}
            icon="👤"
            color="blue"
          />
          <StatCard
            title="Organizations"
            value={loading ? '—' : stats.totalOrgs.toString()}
            icon="🏢"
            color="purple"
          />
          <StatCard
            title="Active Subscriptions"
            value={loading ? '—' : stats.activeSubscriptions.toString()}
            icon="💳"
            color="green"
          />
          <StatCard
            title="Waitlist"
            value={loading ? '—' : stats.waitlistCount.toString()}
            icon="📋"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-6">Admin Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">👥</div>
              <h4 className="text-lg font-bold text-[var(--brand-navy)] mb-2">User Management</h4>
              <p className="text-sm text-gray-600 mb-4">View, search, and manage all platform users</p>
              <Button variant="primary" className="w-full bg-[var(--brand-primary)]">
                Manage Users
              </Button>
            </div>
          </Link>

          <Link href="/admin/organizations" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🏢</div>
              <h4 className="text-lg font-bold text-[var(--brand-navy)] mb-2">Organizations</h4>
              <p className="text-sm text-gray-600 mb-4">View and manage business organizations</p>
              <Button variant="secondary" className="w-full">
                View Organizations
              </Button>
            </div>
          </Link>

          <Link href="/admin/subscriptions" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">💳</div>
              <h4 className="text-lg font-bold text-[var(--brand-navy)] mb-2">Subscriptions</h4>
              <p className="text-sm text-gray-600 mb-4">Monitor subscription status and billing</p>
              <Button variant="secondary" className="w-full">
                View Subscriptions
              </Button>
            </div>
          </Link>

          <Link href="/admin/audit-logs" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📜</div>
              <h4 className="text-lg font-bold text-[var(--brand-navy)] mb-2">Audit Logs</h4>
              <p className="text-sm text-gray-600 mb-4">Track system activity and changes</p>
              <Button variant="secondary" className="w-full">
                View Logs
              </Button>
            </div>
          </Link>

          <Link href="/admin/waitlist" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">📋</div>
              <h4 className="text-lg font-bold text-[var(--brand-navy)] mb-2">Waitlist</h4>
              <p className="text-sm text-gray-600 mb-4">Manage pre-launch waitlist entries</p>
              <Button variant="secondary" className="w-full">
                View Waitlist
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
