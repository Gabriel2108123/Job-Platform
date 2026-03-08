'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, SlidersHorizontal } from 'lucide-react';
import { JobCard } from '@/components/candidate/JobCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, JobDto, JobPagedResult, applyToJob } from '@/lib/api/client';
import { toast } from 'react-hot-toast';

export default function CandidateJobsPage() {
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['candidate-jobs', { search, locationFilter, employmentTypeFilter, currentPage }],
        queryFn: () => getJobs({
            page: currentPage,
            pageSize: 10,
            search: search || undefined,
            location: locationFilter || undefined,
            employmentType: employmentTypeFilter.join(',') || undefined,
        }),
    });

    const applyMutation = useMutation({
        mutationFn: (jobId: string) => applyToJob(jobId),
        onSuccess: (res) => {
            if (res.success) {
                toast.success('Application submitted successfully!');
                queryClient.invalidateQueries({ queryKey: ['applications'] });
            } else {
                toast.error(res.error || 'Failed to submit application');
            }
        },
    });

    const error = queryError instanceof Error ? queryError.message : (data?.success === false ? data.error : null);

    const jobs: JobDto[] = data?.success && data.data
        ? ('items' in data.data ? (data.data as JobPagedResult).items : (data.data as JobDto[]))
        : [];

    const totalCount = data?.success && data.data && 'totalCount' in data.data
        ? (data.data as JobPagedResult).totalCount
        : jobs.length;

    const totalPages = data?.success && data.data && 'totalPages' in data.data
        ? (data.data as JobPagedResult).totalPages
        : 1;

    const toggleEmploymentType = (type: string) => {
        setEmploymentTypeFilter(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
        setCurrentPage(1);
    };

    return (
        <RoleLayout pageTitle="Find your next role">
            <div className="max-w-6xl">
                {/* Search Header */}
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-12">
                    <div className="flex flex-col md:flex-row gap-2">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Job title, keywords, or company"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <div className="md:w-64 relative group">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Location"
                                value={locationFilter}
                                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] px-10 h-auto py-5 font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20 border-none">
                            Search
                        </Button>
                    </div>
                </div>

                {/* Filters and Results */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="hidden lg:block w-72 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Job Type</h4>
                            <div className="space-y-3">
                                {[
                                    { id: 'FullTime', label: 'Full-time' },
                                    { id: 'PartTime', label: 'Part-time' },
                                    { id: 'Contract', label: 'Contract' },
                                    { id: 'Temporary', label: 'Seasonal' }
                                ].map(type => (
                                    <label key={type.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleEmploymentType(type.id)}>
                                        <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${employmentTypeFilter.includes(type.id)
                                                ? 'border-indigo-500 bg-indigo-500'
                                                : 'border-slate-200 dark:border-slate-700 group-hover:border-indigo-400'
                                            }`}>
                                            {employmentTypeFilter.includes(type.id) && <div className="w-2 h-2 rounded-sm bg-white" />}
                                        </div>
                                        <span className={`text-sm font-bold transition-colors ${employmentTypeFilter.includes(type.id) ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-slate-700'
                                            }`}>{type.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Role Category</h4>
                            <div className="space-y-3">
                                {['Front of House', 'Back of House', 'Management', 'Events'].map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-all flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-500 group-hover:text-slate-700 transition-colors">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-sm font-bold text-slate-500">
                                Showing <span className="text-slate-900 dark:text-white">{totalCount} jobs</span> matching your search
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-2">
                                    <SlidersHorizontal className="w-4 h-4" /> Sort: Newest
                                </Button>
                            </div>
                        </div>

                        {loading && (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            </div>
                        )}

                        {error && !loading && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {jobs.map(job => (
                                <JobCard
                                    key={job.id}
                                    job={{
                                        id: job.id,
                                        title: job.title,
                                        company: job.organizationId,
                                        location: job.location,
                                        employmentTypeName: job.employmentTypeName,
                                        salaryMin: job.salaryMin,
                                        salaryMax: job.salaryMax,
                                        salaryCurrency: job.salaryCurrency,
                                        postedAt: 'Just now'
                                    }}
                                    onApply={(id) => applyMutation.mutate(id)}
                                    onView={(id) => window.location.href = `/jobs/${id}`}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-12 py-8">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    className="rounded-xl border-slate-200 font-bold px-6"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-bold text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    className="rounded-xl border-slate-200 font-bold px-6"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
