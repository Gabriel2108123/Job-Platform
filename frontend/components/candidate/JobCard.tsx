import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        employmentTypeName: string;
        salaryMin?: number;
        salaryMax?: number;
        salaryCurrency?: string;
        postedAt?: string;
    };
    onApply?: (id: string) => void;
    onView?: (id: string) => void;
}

export function JobCard({ job, onApply, onView }: JobCardProps) {
    const formatSalary = () => {
        if (!job.salaryMin && !job.salaryMax) return null;
        const min = job.salaryMin?.toLocaleString();
        const max = job.salaryMax?.toLocaleString();
        const currency = job.salaryCurrency || 'GBP';

        if (min && max) return `${currency}${min} - ${currency}${max}`;
        return `${currency}${min || max}`;
    };

    return (
        <Card className="rounded-[1.5rem] border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group bg-white dark:bg-slate-900">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                {job.employmentTypeName}
                            </span>
                            {job.postedAt && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    POSTED {job.postedAt.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors truncate">
                            {job.title}
                        </h3>

                        <div className="text-base font-bold text-slate-600 dark:text-slate-400 mb-4">
                            {job.company}
                        </div>

                        <div className="flex flex-wrap gap-6 items-center">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                <MapPin className="w-4 h-4 text-slate-300" />
                                <span>{job.location}</span>
                            </div>
                            {formatSalary() && (
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                    <Briefcase className="w-4 h-4 text-slate-300" />
                                    <span>{formatSalary()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            className="rounded-xl border-slate-200 dark:border-slate-700 font-black text-[10px] uppercase tracking-widest px-8 py-3 h-auto"
                            onClick={() => onView?.(job.id)}
                        >
                            View Details
                        </Button>
                        <Button
                            variant="primary"
                            className="rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-widest px-8 py-3 h-auto border-none shadow-lg shadow-slate-900/10"
                            onClick={() => onApply?.(job.id)}
                        >
                            Apply Now
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
