'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Users, UserPlus, FileCheck, Briefcase } from 'lucide-react';

export function HiringFunnelWidget() {
    const funnel = [
        { label: 'Active Jobs', value: 4, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'Applications', value: 128, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Interviews', value: 12, icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'Hired (MoM)', value: 3, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ];

    return (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm">
            <CardBody className="p-8">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Hiring Funnel</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {funnel.map(item => (
                        <div key={item.label} className="space-y-4">
                            <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shadow-sm`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-3xl font-black text-slate-900 dark:text-white">{item.value}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
