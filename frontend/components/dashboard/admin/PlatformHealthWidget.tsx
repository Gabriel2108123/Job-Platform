'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Activity, ShieldCheck, Zap, Globe } from 'lucide-react';

export function PlatformHealthWidget() {
    const metrics = [
        { label: 'API Response', value: '42ms', status: 'optimal', icon: Zap },
        { label: 'Success Rate', value: '99.9%', status: 'optimal', icon: ShieldCheck },
        { label: 'Worker Health', value: 'Good', status: 'optimal', icon: Activity },
        { label: 'Active Sessions', value: '4.2k', status: 'stable', icon: Globe },
    ];

    return (
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden bg-slate-900 text-white border-none">
            <CardBody className="p-8">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8">Platform Health</h3>
                <div className="space-y-6">
                    {metrics.map(metric => (
                        <div key={metric.label} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                    <metric.icon className="w-5 h-5 text-indigo-400" />
                                </div>
                                <p className="text-sm font-black text-slate-200">{metric.label}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-white">{metric.value}</p>
                                <div className="flex items-center gap-1 justify-end">
                                    <div className={`w-1.5 h-1.5 rounded-full ${metric.status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{metric.status}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
