'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { PlusCircle, Search, Mail, Settings } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function QuickActionsWidget() {
    const actions = [
        { label: 'Post a New Job', href: ROUTES.BUSINESS.JOBS, icon: PlusCircle, color: 'bg-indigo-600', text: 'text-white' },
        { label: 'Discover Talent', href: ROUTES.BUSINESS.CANDIDATES, icon: Search, color: 'bg-slate-100', text: 'text-slate-900' },
        { label: 'Invite Team', href: ROUTES.BUSINESS.TEAM, icon: Mail, color: 'bg-slate-100', text: 'text-slate-900' },
        { label: 'Edit Profile', href: ROUTES.BUSINESS.SETTINGS, icon: Settings, color: 'bg-slate-100', text: 'text-slate-900' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map(action => (
                <Link key={action.label} href={action.href}>
                    <Card className="rounded-[2rem] border-none shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group h-full">
                        <CardBody className="p-6 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${action.color} ${action.text} flex items-center justify-center shadow-md`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{action.label}</p>
                        </CardBody>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
