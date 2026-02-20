'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/dashboard/StatCard';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { getUser } from '@/lib/auth';
import { getMyApplications, getMyProfile, getWorkExperiences, ApplicationDto, ApplicationStatus } from '@/lib/api/client';

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
    const [profileStrength, setProfileStrength] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data needed for dashboard and strength calc
                const [appsRes, profileRes, workExpRes] = await Promise.all([
                    getMyApplications(),
                    getMyProfile(),
                    getWorkExperiences()
                ]);

                if (appsRes.success && appsRes.data) {
                    setApplications(appsRes.data);
                }

                // Calculate Profile Strength
                let strength = 0;
                // 1. Personal Info (30%)
                if (profileRes.success && profileRes.data) {
                    const p = profileRes.data;
                    if (p.firstName && p.lastName && p.email) strength += 30;
                }

                // 2. Work Experience (30%)
                if (workExpRes && workExpRes.length > 0) {
                    strength += 30;
                }

                // 3. CV / Resume Built (20%)
                if (profileRes.success && profileRes.data && profileRes.data.resumeJson) {
                    strength += 20;
                }

                // 4. Documents Uploaded (20%) - Mocked for now as we don't have doc API yet
                // For now, we'll assume if they have a CV build, they might have docs, 
                // or we just leave it at 80% max until doc system is real.
                // Let's give 20% free if they have > 2 work experiences as a proxy for "strong profile"
                if (workExpRes && workExpRes.length > 2) {
                    strength += 20;
                }

                setProfileStrength(strength);

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
                        <p className="text-gray-500 mt-1">Ready to find your next hospitality career move?</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/jobs">
                            <Button variant="primary" className="shadow-md bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 px-8">
                                🔍 Browse Jobs
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Overview Stats - Cleaner, Less Bold */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* 1. Profile Strength */}
                    <Card className="border border-gray-100 shadow-sm">
                        <CardBody className="p-6 flex items-center gap-6">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="transparent"
                                        strokeDasharray={175}
                                        strokeDashoffset={175 - (175 * profileStrength) / 100}
                                        className="text-emerald-500 transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute text-sm font-bold text-gray-700">{profileStrength}%</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Profile Strength</h3>
                                <p className="text-sm text-gray-500">Complete your profile to stand out.</p>
                                <Link href="/profile" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-1 inline-block">
                                    Improve Profile →
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* 2. Application Activity Tracker */}
                    <Card className="border border-gray-100 shadow-sm">
                        <CardBody className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Application Tracker</h3>
                                    <p className="text-sm text-gray-500">Track your progress across all roles.</p>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    📈
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                                <div className="grid grid-cols-3 relative z-10">
                                    {[
                                        { label: 'Applied', count: applications.filter(a => a.currentStatus === ApplicationStatus.Applied).length, color: 'bg-blue-500' },
                                        { label: 'Interview', count: applications.filter(a => a.currentStatus === ApplicationStatus.Interview).length, color: 'bg-purple-500' },
                                        { label: 'Hired', count: applications.filter(a => a.currentStatus === ApplicationStatus.Hired).length, color: 'bg-emerald-500' }
                                    ].map((step, i) => (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className={`w-8 h-8 rounded-full ${step.color} text-white flex items-center justify-center text-xs font-bold mb-2 shadow-sm`}>
                                                {step.count}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{step.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Applications - Main Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                            <Link href="/applications" className="text-sm font-medium text-[var(--brand-primary)] hover:underline">
                                View All
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                            </div>
                        ) : applications.length === 0 ? (
                            <Card className="border-dashed border-2 bg-gray-50/50">
                                <CardBody className="text-center py-12">
                                    <p className="text-gray-400 mb-4">You haven't applied to any jobs yet.</p>
                                    <Link href="/jobs">
                                        <Button variant="outline">Find Opportunities</Button>
                                    </Link>
                                </CardBody>
                            </Card>
                        ) : (
                            <div className="space-y-3">
                                {applications.slice(0, 4).map((app) => (
                                    <Card key={app.id} className="hover:border-[var(--brand-primary)]/30 transition-colors shadow-sm">
                                        <CardBody className="p-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                                        🏢
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {app.jobId}
                                                        </h4>
                                                        <p className="text-xs text-gray-500">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <Badge className={`${getStatusColor(app.currentStatus)} px-3 py-1`}>
                                                    {getStatusLabel(app.currentStatus)}
                                                </Badge>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Network Section */}
                    <div className="lg:col-span-2 mt-8">
                        <Card className="border border-gray-100 shadow-sm overflow-hidden group">
                            <CardBody className="p-0">
                                <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">My Network</h3>
                                        <p className="text-gray-500 text-sm">Connections & Workplace Discovery</p>
                                    </div>
                                    <Link href="/my-network">
                                        <Button size="sm" variant="outline" className="text-xs">Advanced View</Button>
                                    </Link>
                                </div>
                                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                    {/* Mini Map Representation */}
                                    <div className="flex-1 h-48 bg-blue-50 relative flex items-center justify-center overflow-hidden">
                                        {/* Mock Map Background */}
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=London&zoom=11&size=600x300&key=MOCK_KEY')] bg-cover"></div>
                                        {/* Floating Pins */}
                                        <div className="relative z-10 w-full h-full">
                                            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-lg animate-bounce">📍</div>
                                            <div className="absolute top-1/2 left-2/3 w-6 h-6 bg-[var(--brand-primary)] rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-lg animate-pulse">📍</div>
                                            <div className="absolute bottom-1/4 left-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white shadow-lg">📍</div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-white/90 to-transparent">
                                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">Live Worker Map</p>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-1 bg-white">
                                        <div className="grid grid-cols-2 gap-4 h-full">
                                            <Link href="/my-network?tab=requests" className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                                                <span className="text-xl mb-1">📩</span>
                                                <span className="text-[10px] font-bold text-purple-700 uppercase">Requests</span>
                                                <span className="text-sm font-bold text-purple-900">2 New</span>
                                            </Link>
                                            <Link href="/my-network?tab=suggestions" className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                                                <span className="text-xl mb-1">👥</span>
                                                <span className="text-[10px] font-bold text-blue-700 uppercase">Suggestions</span>
                                                <span className="text-sm font-bold text-blue-900">12</span>
                                            </Link>
                                            <Link href="/my-network?tab=friends" className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg">🤝</span>
                                                    <span className="text-[10px] font-bold text-emerald-700 uppercase">Friends List</span>
                                                </div>
                                                <span className="text-sm font-bold text-emerald-900">45 Active</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* 1. Recent Messages (Inbox Widget) */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardBody className="p-0">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <span>💬</span> Inbox
                                    </h3>
                                    <Link href="/in-development" className="text-xs text-[var(--brand-primary)] hover:underline">
                                        View All
                                    </Link>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {[
                                        { sender: 'The Ritz London', title: 'Interview Invitation', time: '2h ago', unread: true },
                                        { sender: 'Claridge\'s', title: 'Application Update', time: '1d ago', unread: false },
                                        { sender: 'System', title: 'Profile completed', time: '2d ago', unread: false }
                                    ].map((msg, i) => (
                                        <div key={i} className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${msg.unread ? 'bg-blue-50/30' : ''}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-sm font-semibold ${msg.unread ? 'text-gray-900' : 'text-gray-600'}`}>{msg.sender}</span>
                                                <span className="text-xs text-gray-400">{msg.time}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{msg.title}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>


                        {/* 2. Your CV Card */}
                        <Card className="bg-white border border-gray-100 shadow-sm overflow-hidden relative group">
                            <CardBody className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Your CV</h3>
                                        <p className="text-gray-500 text-xs mt-1">Hospitality-standard format.</p>
                                    </div>
                                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                        📄
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 uppercase uppercase tracking-wider">
                                        <span>Completion</span>
                                        <span>{profileStrength}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full transition-all duration-1000"
                                            style={{ width: `${profileStrength}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href="/profile?view=cv">
                                        <Button variant="outline" size="sm" className="w-full text-xs font-bold py-2 h-auto">
                                            View CV
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/cv-builder">
                                        <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 h-auto">
                                            Builder
                                        </Button>
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>

                        {/* 3. Documents */}
                        <Card className="border border-gray-100 shadow-sm">
                            <CardBody className="p-5">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <span>📁</span> Documents
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer group/doc">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="flex-shrink-0 w-8 h-8 bg-red-50 text-red-500 rounded flex items-center justify-center text-xs font-bold uppercase">PDF</span>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-gray-700 truncate">Resume_v2.pdf</p>
                                                <p className="text-[10px] text-gray-400">Modified 2d ago</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/doc:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-500">✏️</button>
                                            <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">🗑️</button>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full text-xs font-bold py-2 h-auto border-dashed">
                                        + Upload Document
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
