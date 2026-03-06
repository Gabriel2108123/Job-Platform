'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Users, Eye, Clock, MoreVertical, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BusinessJobCardProps {
    job: {
        id: string;
        title: string;
        status: 'Active' | 'Draft' | 'Closed';
        applicants: number;
        views: number;
        postedAt: string;
        location: string;
    };
}

export function BusinessJobCard({ job }: BusinessJobCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-slate-900">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${job.status === 'Active' ? 'bg-emerald-100 text-emerald-600' :
                                    job.status === 'Draft' ? 'bg-slate-100 text-slate-500' :
                                        'bg-rose-100 text-rose-600'
                                }`}>
                                {job.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                Posted {job.postedAt}
                            </span>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mb-6">{job.location}</p>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-500" />
                                <span className="text-xs font-black text-slate-900 dark:text-white">{job.applicants} <span className="text-slate-400 font-bold">Applicants</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Eye className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-black text-slate-900 dark:text-white">{job.views} <span className="text-slate-400 font-bold">Views</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest px-6 flex items-center gap-2">
                            <Edit2 className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="primary" className="rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-6 border-none">
                            View Pipeline
                        </Button>
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-700 p-3">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
