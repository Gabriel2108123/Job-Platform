'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RequireRole';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';

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
      const baseUrl = 'http://localhost:5205';
      try {
        // Fetch users count
        const usersRes = await fetch(`${baseUrl}/api/admin/users?page=1&pageSize=1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setStats(prev => ({ ...prev, totalUsers: usersData.totalCount || 0 }));
        }

        // Fetch organizations count
        const orgsRes = await fetch(`${baseUrl}/api/admin/organizations?page=1&pageSize=1`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (orgsRes.ok) {
          const orgsData = await orgsRes.json();
          setStats(prev => ({ ...prev, totalOrgs: orgsData.totalCount || 0 }));
        }

        // Fetch subscriptions
        const subsRes = await fetch(`${baseUrl}/api/admin/subscriptions`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (subsRes.ok) {
          const subsData = await subsRes.json();
          const subs = subsData.data || [];
          const active = subs.filter((s: any) => s.status === 'Active').length;
          setStats(prev => ({ ...prev, activeSubscriptions: active }));
        }

        // Fetch waitlist count
        const waitlistRes = await fetch(`${baseUrl}/api/waitlist`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (waitlistRes.ok) {
          const waitlistData = await waitlistRes.json();
          setStats(prev => ({ ...prev, waitlistCount: (waitlistData.data || []).length }));
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
