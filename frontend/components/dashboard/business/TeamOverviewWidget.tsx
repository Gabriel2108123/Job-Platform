'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Shield, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function TeamOverviewWidget() {
    const members = [
        { id: '1', name: 'James Wilson', role: 'Staff Manager', access: 'Admin' },
        { id: '2', name: 'Sarah Blake', role: 'Supervisor', access: 'Staff' },
        { id: '3', name: 'Michael Ross', role: 'Recruiter', access: 'Staff' },
    ];

    return (
        <Card className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardBody className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Team Overview</h3>
                    <Link href={ROUTES.BUSINESS.TEAM} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        Manage Team
                    </Link>
                </div>

                <div className="space-y-6">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                    <User className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{member.name}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{member.role}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${member.access === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {member.access}
                            </span>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
