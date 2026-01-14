'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RequireRole';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { getUser } from '@/lib/auth';

export default function BusinessDashboard() {
  return (
    <RequireAuth>
      <RequireRole allowedRoles={['BusinessOwner', 'Staff']}>
        <BusinessDashboardContent />
      </RequireRole>
    </RequireAuth>
  );
}

function BusinessDashboardContent() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const baseUrl = 'http://localhost:5205';
      try {
        // Get jobs for organization
        const jobsRes = await fetch(`${baseUrl}/api/jobs/organization`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (jobsRes.ok) {
          const jobsData = await jobsRes.json();
          const jobs = jobsData.data || [];
          setStats(prev => ({
            ...prev,
            totalJobs: jobs.length,
            activeJobs: jobs.filter((j: any) => j.isOpen).length
          }));
          
          // Count applications across all jobs
          let totalApps = 0;
          for (const job of jobs) {
            const appRes = await fetch(`${baseUrl}/api/applications/job/${job.id}`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (appRes.ok) {
              const appData = await appRes.json();
              totalApps += (appData.data || []).length;
            }
          }
          setStats(prev => ({ ...prev, totalApplications: totalApps }));
        }

        // Get unread message count
        const msgsRes = await fetch(`${baseUrl}/api/messaging/conversations`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (msgsRes.ok) {
          const msgsData = await msgsRes.json();
          const conversations = msgsData.data || [];
          const unread = conversations.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
          setStats(prev => ({ ...prev, unreadMessages: unread }));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title={`Welcome back, ${user?.name || 'Business Owner'}`}
          description="Your recruitment hub for managing jobs, applications, and candidates"
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Total Jobs"
            value={loading ? '—' : stats.totalJobs.toString()}
            icon="💼"
            color="blue"
          />
          <StatCard
            title="Active Jobs"
            value={loading ? '—' : stats.activeJobs.toString()}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Applications"
            value={loading ? '—' : stats.totalApplications.toString()}
            icon="📝"
            color="purple"
          />
          <StatCard
            title="Unread Messages"
            value={loading ? '—' : stats.unreadMessages.toString()}
            icon="💬"
            color="yellow"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/business/jobs/new" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-2 border-[var(--brand-primary)] border-opacity-20">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">Post a New Job</h3>
              <p className="text-gray-600 mb-4">Create and publish a new job listing</p>
              <Button variant="primary" className="w-full bg-[var(--brand-primary)]">
                Create Job
              </Button>
            </div>
          </Link>

          <Link href="/business/pipeline" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">View Pipeline</h3>
              <p className="text-gray-600 mb-4">Manage applicants through hiring stages</p>
              <Button variant="secondary" className="w-full">
                Open Pipeline
              </Button>
            </div>
          </Link>

          <Link href="/messages" className="block group">
            <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-xl font-bold text-[var(--brand-navy)] mb-2">Messages</h3>
              <p className="text-gray-600 mb-4">Chat with candidates
                {stats.unreadMessages > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {stats.unreadMessages} new
                  </span>
                )}
              </p>
              <Button variant="secondary" className="w-full">
                Open Messages
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
