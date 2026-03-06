'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { MapPin, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        type: string;
        salary: string;
        postedAt: string;
        tags: string[];
    };
}

export function JobCard({ job }: JobCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                                {job.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Posted {job.postedAt}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {job.title}
                        </h3>

                        <div className="flex items-center gap-1 text-sm font-bold text-slate-600 dark:text-slate-400 mb-4">
                            {job.company}
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-slate-400" /> {job.salary}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest px-6">
                            View Details
                        </Button>
                        <Button variant="primary" className="rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest px-6 border-none">
                            Apply Now
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
