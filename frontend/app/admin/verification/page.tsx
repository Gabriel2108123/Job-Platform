'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Building2, Clock, CheckCircle2, XCircle, Flag, Search, AlertCircle } from 'lucide-react';
import { getAuthHeaders } from '@/lib/auth';

interface PendingBusiness {
    id: string;
    name: string;
    registeredAt: string;
    email: string;
    location: string;
    documentsUploaded: number;
    priority: 'High' | 'Normal' | 'Low';
}

const priorityColors: Record<string, string> = {
    High: 'bg-rose-100 text-rose-600',
    Normal: 'bg-amber-100 text-amber-600',
    Low: 'bg-slate-100 text-slate-500',
};

export default function AdminVerificationPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [reviewing, setReviewing] = useState<PendingBusiness | null>(null);

    const { data: queue = [], isLoading } = useQuery<PendingBusiness[]>({
        queryKey: ['admin-verification-queue'],
        queryFn: async () => {
            const res = await fetch('/api/admin/businesses/pending', { headers: getAuthHeaders() });
            if (!res.ok) return [];
            return res.json();
        },
    });

    const action = useMutation({
        mutationFn: async ({ id, verdict }: { id: string; verdict: 'approve' | 'reject' | 'flag' }) => {
            const res = await fetch(`/api/admin/businesses/${id}/verify`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ verdict }),
            });
            if (!res.ok) throw new Error();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-verification-queue'] });
            setReviewing(null);
        },
    });

    const filtered = queue.filter(b =>
        !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <RoleLayout
            pageTitle="Verification Queue"
            pageActions={
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{queue.length} Pending</span>
                </div>
            }
        >
            <div className="max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Businesses awaiting manual review</p>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search businesses..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
                        <p className="font-black text-slate-500">Queue is clear!</p>
                        <p className="text-xs font-bold text-slate-400 mt-2">No businesses pending review.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(biz => (
                            <Card key={biz.id} className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                <CardBody className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <Building2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-black text-slate-900 dark:text-white">{biz.name}</h3>
                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${priorityColors[biz.priority]}`}>{biz.priority}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-500">{biz.email} · {biz.location}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Registered {new Date(biz.registeredAt).toLocaleDateString('en-GB')}
                                                    · {biz.documentsUploaded} doc(s) uploaded
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-black text-xs uppercase tracking-widest text-amber-600 border-amber-200"
                                                onClick={() => action.mutate({ id: biz.id, verdict: 'flag' })}
                                                disabled={action.isPending}
                                            >
                                                <Flag className="w-3.5 h-3.5 mr-1" /> Flag
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-black text-xs uppercase tracking-widest text-rose-600 border-rose-200"
                                                onClick={() => action.mutate({ id: biz.id, verdict: 'reject' })}
                                                disabled={action.isPending}
                                            >
                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                            </Button>
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                className="rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-600 border-none"
                                                onClick={() => action.mutate({ id: biz.id, verdict: 'approve' })}
                                                disabled={action.isPending}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
