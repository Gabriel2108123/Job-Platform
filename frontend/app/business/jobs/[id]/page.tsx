'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ROUTES } from '@/config/routes';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Eye, MapPin, Briefcase, Edit2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { getAuthHeaders } from '@/lib/auth';

interface Job {
    id: string;
    title: string;
    location: string;
    department: string;
    type: string;
    description: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    status: 'Active' | 'Draft' | 'Closed';
    applicants?: number;
    views?: number;
    postedAt?: string;
}

interface Application {
    id: string;
    candidateUserId: string;
    candidateName: string;
    candidateRole: string;
    currentStatus: string;
    appliedAt: string;
}

const fetchJob = async (id: string): Promise<Job> => {
    const res = await fetch(`/api/jobs/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Job not found');
    return res.json();
};

const fetchApplications = async (jobId: string): Promise<Application[]> => {
    const res = await fetch(`/api/applications?jobId=${jobId}`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    return res.json();
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    Active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
    Draft: { label: 'Draft', color: 'bg-slate-100 text-slate-500' },
    Closed: { label: 'Closed', color: 'bg-rose-100 text-rose-600' },
};

const APP_STATUS_COLORS: Record<string, string> = {
    Applied: 'bg-blue-100 text-blue-600',
    Shortlisted: 'bg-indigo-100 text-indigo-600',
    Interview: 'bg-amber-100 text-amber-600',
    Trial: 'bg-purple-100 text-purple-600',
    Hired: 'bg-emerald-100 text-emerald-600',
    Rejected: 'bg-rose-100 text-rose-600',
};

export default function JobDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [statusOpen, setStatusOpen] = useState(false);

    const { data: job, isLoading: jobLoading } = useQuery({
        queryKey: ['job', id],
        queryFn: () => fetchJob(id),
    });

    const { data: applications = [], isLoading: appsLoading } = useQuery({
        queryKey: ['job-applications', id],
        queryFn: () => fetchApplications(id),
    });

    const updateStatus = useMutation({
        mutationFn: async (newStatus: string) => {
            const res = await fetch(`/api/jobs/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['job', id] });
            setStatusOpen(false);
        },
    });

    if (jobLoading) {
        return (
            <RoleLayout pageTitle="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            </RoleLayout>
        );
    }

    if (!job) {
        return (
            <RoleLayout pageTitle="Job Not Found">
                <div className="text-center py-20">
                    <p className="text-slate-500 font-bold mb-4">This job could not be found.</p>
                    <Link href={ROUTES.BUSINESS.JOBS}><Button variant="primary">Back to Jobs</Button></Link>
                </div>
            </RoleLayout>
        );
    }

    const statusInfo = STATUS_LABELS[job.status] || STATUS_LABELS.Draft;

    return (
        <RoleLayout
            pageTitle={job.title}
            pageActions={
                <div className="flex items-center gap-3">
                    <Link href={ROUTES.BUSINESS.JOBS}>
                        <Button variant="outline" className="flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest">
                            <ArrowLeft className="w-4 h-4" /> Jobs
                        </Button>
                    </Link>
                    <div className="relative">
                        <Button
                            variant="outline"
                            className={`flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest px-4 ${statusInfo.color} border-transparent`}
                            onClick={() => setStatusOpen(o => !o)}
                        >
                            {statusInfo.label} <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                        {statusOpen && (
                            <div className="absolute right-0 top-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-30 min-w-[140px]">
                                {(['Active', 'Draft', 'Closed'] as const).map(s => (
                                    <button
                                        key={s}
                                        className="w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        onClick={() => updateStatus.mutate(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Link href={`${ROUTES.BUSINESS.JOBS}/${id}/edit`}>
                        <Button variant="primary" className="flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest px-5">
                            <Edit2 className="w-4 h-4" /> Edit Role
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="max-w-5xl space-y-8">
                {/* Job Overview */}
                <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
                    <CardBody className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {job.department && <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 text-xs font-black uppercase tracking-widest">{job.department}</span>}
                                    {job.type && <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-black uppercase tracking-widest">{job.type}</span>}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                                    <MapPin className="w-4 h-4" /> {job.location}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{job.description}</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Salary</p>
                                    <p className="font-black text-slate-900 dark:text-white">
                                        {job.salaryMin && job.salaryMax ? `${job.salaryCurrency} ${job.salaryMin.toLocaleString()}–${job.salaryMax.toLocaleString()}` : 'Not specified'}
                                    </p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Applicants</p>
                                    <p className="text-2xl font-black text-indigo-600">{applications.length}</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Applicants */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Applicants ({applications.length})</h3>
                        <Link href={`/business/applications?jobId=${id}`}>
                            <Button variant="outline" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4" /> Full Pipeline
                            </Button>
                        </Link>
                    </div>
                    {appsLoading ? (
                        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                    ) : applications.length === 0 ? (
                        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800">
                            <CardBody className="p-12 text-center">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="font-black text-slate-500 mb-1">No applications yet</p>
                                <p className="text-sm text-slate-400">{job.status === 'Draft' ? 'Publish this job to start receiving applicants.' : 'Check back soon — your listing is live.'}</p>
                            </CardBody>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {applications.map(app => (
                                <Card key={app.id} className="rounded-[1.5rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                    <CardBody className="p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                    <span className="font-black text-slate-500 text-sm">{app.candidateName?.[0] || '?'}</span>
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{app.candidateName}</p>
                                                    <p className="text-xs font-bold text-slate-500">{app.candidateRole}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-black uppercase tracking-widest ${APP_STATUS_COLORS[app.currentStatus] || 'bg-slate-100 text-slate-500'}`}>
                                                    {app.currentStatus}
                                                </span>
                                                <Link href={`/business/applications/${app.id}`}>
                                                    <Button variant="outline" size="sm" className="rounded-xl font-black text-xs uppercase tracking-widest">
                                                        Review
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RoleLayout>
    );
}
