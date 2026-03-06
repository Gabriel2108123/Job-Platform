'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { Clock, User, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/Card';

export default function BusinessActivityPage() {
    const events = [
        { id: '1', user: 'James Wilson', action: 'moved', target: 'Alex Rivera', detail: 'to Interview stage', time: '10m ago', icon: CheckCircle2, color: 'text-emerald-500' },
        { id: '2', user: 'Sarah Blake', action: 'edited', target: 'Senior Bartender', detail: 'role description', time: '1h ago', icon: Briefcase, color: 'text-indigo-500' },
        { id: '3', user: 'Gabriel Owners', action: 'updated', target: 'Billing info', detail: 'new card ending in 4242', time: '3h ago', icon: FileText, color: 'text-blue-500' },
        { id: '4', user: 'Michael Ross', action: 'invited', target: 'Elena Petrova', detail: 'as Staff Member', time: '5h ago', icon: User, color: 'text-amber-500' },
    ];

    return (
        <RoleLayout pageTitle="Activity Log">
            <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Platform Audit Trail</p>
                    <div className="flex items-center gap-2 text-xs font-black text-indigo-600 cursor-pointer">
                        Export CSV <FileText className="w-3.5 h-3.5" />
                    </div>
                </div>

                <div className="relative space-y-6 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                    {events.map(event => (
                        <div key={event.id} className="relative pl-12 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                            {/* Timeline dot */}
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center z-10 transition-colors group-hover:border-indigo-500`}>
                                <event.icon className={`w-5 h-5 ${event.color}`} />
                            </div>

                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-black text-slate-900 dark:text-white">{event.user}</span> {event.action} <span className="font-black text-slate-900 dark:text-white">{event.target}</span> {event.detail}
                                </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                <Clock className="w-3.5 h-3.5" /> {event.time}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs font-bold text-slate-500">Only showing recent workspace activity. View full history in Admin Panel.</p>
                </div>
            </div>
        </RoleLayout>
    );
}
