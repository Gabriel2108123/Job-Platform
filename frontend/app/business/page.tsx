'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireRole } from '@/components/auth/RoleBasedAccess';
import { StatCard } from '@/components/dashboard/StatCard';
import { CandidatePreviewCard } from '@/components/business/CandidatePreviewCard';
import { getUser } from '@/lib/auth';
import { apiRequest } from '@/lib/api/client';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'postings'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiRequest<any>('/api/jobs/analytics');
        if (res.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Modern Tabbed Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] mb-1">{getTimeGreeting()}, {user?.name?.split(' ')[0]}</p>
              <h1 className="text-4xl font-black text-[var(--brand-navy)] tracking-tight">Recruitment HQ</h1>
            </div>
            <div className="flex bg-gray-100/80 p-1 rounded-xl">
              {(['overview', 'analytics', 'postings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="animate-fade-in space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Active Jobs" value={analytics?.activeJobs || 0} icon="💼" color="#6366F1" />
                <StatCard label="Total Views" value={analytics?.totalViews || 0} icon="👁️" color="#10B981" />
                <StatCard label="Total Apps" value={analytics?.totalApplications || 0} icon="📄" color="#F59E0B" />
                <StatCard label="Hiring Velocity" value="High" icon="⚡" color="#EF4444" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[var(--brand-navy)]">Recent Talent Pulse</h2>
                    <Link href="/business/pipeline" className="text-sm font-bold text-indigo-600 hover:underline">View All Pipeline</Link>
                  </div>
                  <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                    <CardBody className="p-2">
                      <CandidatePreviewCard name="Alex Thompson" role="Head Chef" status="New" appliedAt="2h ago" />
                      <CandidatePreviewCard name="Sarah Miller" role="Floor Manager" status="Shortlisted" appliedAt="5h ago" />
                      <CandidatePreviewCard name="James Wilson" role="Barista" status="New" appliedAt="Yesterday" />
                    </CardBody>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="bg-indigo-600 text-white rounded-3xl border-none shadow-xl">
                    <CardBody className="p-6">
                      <h3 className="font-bold mb-2">Smart Suggestions</h3>
                      <p className="text-indigo-100 text-sm mb-4">Your "Head Chef" post is trending. Consider adding a video intro to boost applications by 30%.</p>
                      <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">Upgrade Now</Button>
                    </CardBody>
                  </Card>
                  <Card className="rounded-3xl border-none shadow-sm">
                    <CardBody className="p-6 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">📄</div>
                      <h3 className="font-bold text-gray-900">Weekly Summary</h3>
                      <p className="text-xs text-gray-500 mb-4">Report for Jan 19 - Jan 25</p>
                      <button className="text-indigo-600 text-sm font-bold hover:underline">Download Report</button>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fade-in bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-black text-[var(--brand-navy)] mb-8">Performance Analytics</h2>
              <div className="space-y-10">
                {/* Visual Chart Placeholder */}
                <div className="h-64 bg-gray-50 rounded-2xl flex items-end justify-between px-10 pb-6 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 text-indigo-900 font-bold text-8xl pointer-events-none">DATA</div>
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="w-12 bg-indigo-500 rounded-t-lg transition-all hover:bg-indigo-600 cursor-help" style={{ height: `${h}%` }}></div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4">Job Performance Leaderboard</h3>
                  <div className="overflow-hidden rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Views</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Apps</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">CR %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analytics?.topPerformingJobs?.map((job: any) => (
                          <tr key={job.jobId} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">{job.title}</td>
                            <td className="px-6 py-4 text-gray-500">{job.views}</td>
                            <td className="px-6 py-4 text-gray-500">{job.applications}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {job.conversionRate}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'postings' && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--brand-navy)]">Active Listings</h2>
                <Link href="/business/jobs/new">
                  <Button variant="primary" className="bg-indigo-600 rounded-xl">+ Create New Post</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Here we would map real jobs */}
                <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardBody className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-green-100 text-green-800 border-none">Live</Badge>
                      <span className="text-gray-300">⋮</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">Head Chef</h3>
                    <p className="text-sm text-gray-500 mb-4">Mayfair, London</p>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                      <span>👁️ 1,240</span>
                      <span>📄 42</span>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
