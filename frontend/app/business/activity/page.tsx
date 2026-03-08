'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery } from '@tanstack/react-query';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, User, Briefcase, FileText, CheckCircle2, AlertCircle, Download, Filter } from 'lucide-react';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

const ICON_MAP: Record<string, any> = {
    application: User,
    job: Briefcase,
    team: User,
    billing: FileText,
    pipeline: CheckCircle2,
};

const COLOR_MAP: Record<string, string> = {
    application: 'text-blue-500',
    job: 'text-indigo-500',
    team: 'text-amber-500',
    billing: 'text-emerald-500',
    pipeline: 'text-purple-500',
};

interface AuditEvent {
    id: string;
    actorName: string;
    action: string;
    target: string;
    detail: string;
    eventType: string;
    createdAt: string;
}

export default function BusinessActivityPage() {
    const orgId = getOrganizationId();
    const [exporting, setExporting] = useState(false);

    const { data: events = [], isLoading } = useQuery<AuditEvent[]>({
        queryKey: ['audit-log', orgId],
        queryFn: async () => {
            const res = await fetch(`/api/audit-logs?orgId=${orgId}&limit=50`, { headers: getAuthHeaders() });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: !!orgId,
    });

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await fetch(`/api/audit-logs/export?orgId=${orgId}&format=csv`, { headers: getAuthHeaders() });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const formatTime = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' at ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <RoleLayout pageTitle="Activity Log">
            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Audit Trail</p>
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 text-xs font-black text-indigo-600 cursor-pointer rounded-xl uppercase tracking-widest"
                        onClick={handleExport}
                        disabled={exporting}
                    >
                        <Download className="w-3.5 h-3.5" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="font-black text-slate-500">No activity recorded yet.</p>
                        <p className="text-xs font-bold text-slate-400 mt-2">Actions taken by you and your team will appear here.</p>
                    </div>
                ) : (
                    <div className="relative space-y-6 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                        {events.map(event => {
                            const IconComponent = ICON_MAP[event.eventType] || FileText;
                            const color = COLOR_MAP[event.eventType] || 'text-slate-400';
                            return (
                                <div key={event.id} className="relative pl-12 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                    <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10 transition-colors group-hover:border-indigo-500`}>
                                        <IconComponent className={`w-5 h-5 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            <span className="font-black text-slate-900 dark:text-white">{event.actorName}</span>{' '}
                                            {event.action}{' '}
                                            <span className="font-black text-slate-900 dark:text-white">{event.target}</span>{' '}
                                            {event.detail}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        <Clock className="w-3.5 h-3.5" /> {formatTime(event.createdAt)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs font-bold text-slate-500">Showing up to 50 most recent events. Export CSV for full history.</p>
                </div>
            </div>
        </RoleLayout>
    );
}
