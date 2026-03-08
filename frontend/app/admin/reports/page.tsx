'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, User, CheckCircle2, Ban, X, AlertCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface Report {
    id: string;
    reportedUserName: string;
    reportedUserId: string;
    reason: string;
    detail: string;
    priority: 'High' | 'Medium' | 'Low';
    createdAt: string;
}

const priorityColors: Record<string, string> = {
    High: 'bg-rose-100 text-rose-600',
    Medium: 'bg-amber-100 text-amber-600',
    Low: 'bg-slate-100 text-slate-500',
};

export default function AdminReportsPage() {
    const queryClient = useQueryClient();

    const { data: reports = [], isLoading } = useQuery<Report[]>({
        queryKey: ['admin-reports'],
        queryFn: async () => {
            const res = await fetch('/api/admin/reports', { headers: getAuthHeaders() });
            if (!res.ok) return [];
            return res.json();
        },
    });

    const action = useMutation({
        mutationFn: async ({ userId, reportId, verdict }: { userId: string; reportId: string; verdict: 'warn' | 'ban' | 'dismiss' }) => {
            const res = await fetch(`/api/admin/users/${userId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ verdict, reportId }),
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
    });

    return (
        <RoleLayout pageTitle="Active Reports"
            pageActions={
                <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 rounded-2xl">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-black text-rose-600 uppercase tracking-widest">{reports.length} Active</span>
                </div>
            }
        >
            <div className="max-w-5xl space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">User-flagged reports requiring resolution</p>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
                        <p className="font-black text-slate-500">No active reports.</p>
                    </div>
                ) : (
                    reports.map(report => (
                        <Card key={report.id} className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardBody className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                                            <User className="w-6 h-6 text-rose-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-slate-900 dark:text-white">{report.reportedUserName}</h3>
                                                <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${priorityColors[report.priority]}`}>{report.priority}</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">{report.reason}</p>
                                            <p className="text-sm text-slate-500">{report.detail}</p>
                                            <p className="text-xs font-bold text-slate-400 mt-2">{new Date(report.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        <Button
                                            variant="outline" size="sm"
                                            className="rounded-xl font-black text-xs uppercase tracking-widest text-slate-500"
                                            onClick={() => action.mutate({ userId: report.reportedUserId, reportId: report.id, verdict: 'dismiss' })}
                                            disabled={action.isPending}
                                        >
                                            <X className="w-3.5 h-3.5 mr-1" /> Dismiss
                                        </Button>
                                        <Button
                                            variant="outline" size="sm"
                                            className="rounded-xl font-black text-xs uppercase tracking-widest text-amber-600 border-amber-200"
                                            onClick={() => action.mutate({ userId: report.reportedUserId, reportId: report.id, verdict: 'warn' })}
                                            disabled={action.isPending}
                                        >
                                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Warn
                                        </Button>
                                        <Button
                                            variant="primary" size="sm"
                                            className="rounded-xl font-black text-xs uppercase tracking-widest bg-rose-600 border-none"
                                            onClick={() => action.mutate({ userId: report.reportedUserId, reportId: report.id, verdict: 'ban' })}
                                            disabled={action.isPending}
                                        >
                                            <Ban className="w-3.5 h-3.5 mr-1" /> Ban User
                                        </Button>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))
                )}
            </div>
        </RoleLayout>
    );
}
