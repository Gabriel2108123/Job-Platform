'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function ApplicationsSummaryWidget() {
    const stats = [
        { label: 'Active', value: 8, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'Interviews', value: 2, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Offers', value: 1, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardBody className="p-6">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Track Applications</h3>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {stats.map(stat => (
                        <div key={stat.label} className="flex flex-col items-center">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-2`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <Link href={ROUTES.CANDIDATE.APPLICATIONS}>
                    <button className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
                        Manage Applications
                    </button>
                </Link>
            </CardBody>
        </Card>
    );
}
