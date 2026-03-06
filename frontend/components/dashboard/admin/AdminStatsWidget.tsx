'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Users, Building2, Briefcase, TrendingUp } from 'lucide-react';

export function AdminStatsWidget() {
    const stats = [
        { label: 'Total Users', value: '12,482', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Businesses', value: '842', change: '+5%', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Live Jobs', value: '3,120', change: '+18%', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Revenue (MTD)', value: '£42.5k', change: '+24%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(stat => (
                <Card key={stat.label} className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm border-none shadow-slate-200/50">
                    <CardBody className="p-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}
