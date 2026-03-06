'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, MapPin, Filter, SlidersHorizontal } from 'lucide-react';
import { JobCard } from '@/components/candidate/JobCard';

export default function CandidateJobsPage() {
    // Mock jobs
    const jobs = [
        { id: '1', title: 'Senior Bartender', company: 'The Alchemist', location: 'Soho, London', type: 'Full-time', salary: '£28k - £32k', postedAt: '2h ago', tags: ['Cocktails', 'Management'] },
        { id: '2', title: 'Head Chef', company: 'Dishoom', location: 'King\'s Cross, London', type: 'Full-time', salary: '£45k - £50k', postedAt: '5h ago', tags: ['Indian Cuisine', 'Leadership'] },
        { id: '3', title: 'Wait Staff', company: 'Breakfast Club', location: 'Brighton, UK', type: 'Part-time', salary: '£12 - £15/hr', postedAt: '1d ago', tags: ['Customer Service'] },
        { id: '4', title: 'Hotel Concierge', company: 'The Savoy', location: 'The Strand, London', type: 'Full-time', salary: '£30k - £35k', postedAt: '2d ago', tags: ['Guest Relations', 'Luxury'] },
    ];

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
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <div className="md:w-64 relative group">
                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Location (city or postcode)"
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-5 pl-14 pr-6 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                        <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] px-10 border-none h-auto py-5 font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                            Search
                        </Button>
                    </div>
                </div>

                {/* Filters and Results */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters - Hidden on mobile, can be a drawer */}
                    <div className="hidden lg:block w-72 space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Job Type</h4>
                            <div className="space-y-3">
                                {['Full-time', 'Part-time', 'Contract', 'Seasonal'].map(type => (
                                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{type}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Role Category</h4>
                            <div className="space-y-3">
                                {['Front of House', 'Back of House', 'Management', 'Events'].map(cat => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-sm bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Results Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-sm font-bold text-slate-500">
                                Showing <span className="text-slate-900 dark:text-white">4 jobs</span> matching your search
                            </p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-2">
                                    <SlidersHorizontal className="w-4 h-4" /> Sort: Newest
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {jobs.map(job => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
