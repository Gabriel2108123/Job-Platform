'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Briefcase, MapPin, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function RecommendedJobsWidget() {
    // Mock data for Phase 3
    const jobs = [
        { id: '1', title: 'Senior Bartender', company: 'The Alchemist', location: 'Soho, London', type: 'Full-time', salary: '£28k - £32k' },
        { id: '2', title: 'Head Chef', company: 'Dishoom', location: 'King\'s Cross, London', type: 'Full-time', salary: '£45k - £50k' },
    ];

    return (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Recommended for you</h3>
                    <Link href={ROUTES.CANDIDATE.JOBS} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                        View all
                    </Link>
                </div>

                <div className="space-y-4">
                    {jobs.map(job => (
                        <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-900 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {job.title}
                                    </h4>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-md uppercase">
                                        {job.type}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">{job.company}</p>
                                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-medium">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="w-3 h-3" /> {job.salary}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
