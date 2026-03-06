'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Clock, MapPin, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ApplicationCardProps {
    application: {
        id: string;
        jobTitle: string;
        company: string;
        location: string;
        status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
        appliedDate: string;
        lastUpdate: string;
    };
}

const statusColors = {
    Applied: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    Screening: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    Interview: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    Offer: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    Rejected: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    Withdrawn: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
};

export function ApplicationCard({ application }: ApplicationCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[application.status]}`}>
                                {application.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Applied {application.appliedDate}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                            {application.jobTitle}
                        </h3>
                        <p className="text-sm font-bold text-slate-500 mb-4">{application.company}</p>

                        <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" /> {application.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Updated {application.lastUpdate}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest px-6 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Messages
                        </Button>
                        <Button variant="primary" className="rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-6 border-none">
                            View Status
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
