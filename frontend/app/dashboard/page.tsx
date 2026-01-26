'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { getUser } from '@/lib/auth';
import { getMyApplications, ApplicationDto, ApplicationStatus } from '@/lib/api/client';

export default function DashboardPage() {
    return (
        <RequireAuth>
            <DashboardContent />
        </RequireAuth>
    );
}

function DashboardContent() {
    const user = getUser();
    const [applications, setApplications] = useState<ApplicationDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getMyApplications();
                if (res.success && res.data) {
                    setApplications(res.data);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.Applied: return 'bg-blue-100 text-blue-800';
            case ApplicationStatus.Interview: return 'bg-purple-100 text-purple-800';
            case ApplicationStatus.Hired: return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.Applied: return 'Applied';
            case ApplicationStatus.Interview: return 'Interviewing';
            case ApplicationStatus.Hired: return 'Hired';
            case ApplicationStatus.Rejected: return 'Closed';
            default: return 'Pending';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--brand-navy)]">
                            Welcome back, {user?.name?.split(' ')[0] || 'Professional'}! 👋
                        </h1>
                        <p className="text-gray-500 mt-1">Here's what's happening with your job search.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/jobs">
                            <Button variant="outline" className="shadow-sm">Browse Jobs</Button>
                        </Link>
                        <Link href="/profile">
                            <Button variant="primary" className="bg-[var(--brand-primary)] shadow-md">Edit Profile</Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard label="Active Applications" value={applications.length} icon="📄" color="#3B82F6" />
                    <StatCard label="Interviews" value={applications.filter(a => a.currentStatus === ApplicationStatus.Interview).length} icon="🎯" color="#8B5CF6" />
                    <StatCard label="Upcoming Tasks" value="3" icon="📅" color="#F59E0B" />
                    <StatCard label="Profile Strength" value="85%" icon="⚡" color="#10B981" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Applications */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--brand-navy)]">Recent Applications</h2>
                            <Link href="/applications" className="text-sm font-semibold text-[var(--brand-primary)] hover:underline">
                                View All
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                            </div>
                        ) : applications.length === 0 ? (
                            <Card className="border-dashed border-2">
                                <CardBody className="text-center py-12">
                                    <p className="text-gray-400 mb-4 text-lg">No applications yet.</p>
                                    <Link href="/jobs">
                                        <Button variant="outline">Find your first job</Button>
                                    </Link>
                                </CardBody>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {applications.slice(0, 4).map((app) => (
                                    <Card key={app.id} className="hover:shadow-md transition-shadow group">
                                        <CardBody className="p-5">
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                                                        🏢
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">
                                                            {app.jobId /* In future fetch Job title */}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge className={getStatusColor(app.currentStatus)}>
                                                    {getStatusLabel(app.currentStatus)}
                                                </Badge>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        {/* CV Builder Preview */}
                        <Card className="bg-gradient-to-br from-[var(--brand-navy)] to-[#1e293b] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">📄</div>
                            <CardBody className="relative z-10 p-6">
                                <h3 className="text-xl font-bold mb-2">CV Builder</h3>
                                <p className="text-blue-100/70 text-sm mb-6">Create a professional CV tailored for hospitality in minutes.</p>
                                <Link href="/dashboard/cv-builder">
                                    <Button variant="primary" className="w-full bg-[var(--brand-primary)] border-none">
                                        Open Builder
                                    </Button>
                                </Link>
                            </CardBody>
                        </Card>

                        {/* Documents Card */}
                        <Card>
                            <CardBody className="p-6">
                                <h3 className="text-lg font-bold text-[var(--brand-navy)] mb-4 flex items-center gap-2">
                                    <span>📁</span> Documents
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <span className="text-red-500 text-xl">PDF</span>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">Resume_v2.pdf</p>
                                                <p className="text-xs text-gray-400">2.4 MB</p>
                                            </div>
                                        </div>
                                        <span className="text-gray-300">⋮</span>
                                    </div>
                                    <Button variant="outline" className="w-full text-sm py-2">
                                        + Upload New
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
