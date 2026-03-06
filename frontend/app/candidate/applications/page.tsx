'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ApplicationCard } from '@/components/candidate/ApplicationCard';
import { Clock, CheckCircle2, XCircle, Search } from 'lucide-react';

export default function CandidateApplicationsPage() {
    const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

    const allApplications = [
        { id: '1', jobTitle: 'Senior Bartender', company: 'The Alchemist', location: 'Soho, London', status: 'Interview' as const, appliedDate: '2 days ago', lastUpdate: '5 hours ago' },
        { id: '2', jobTitle: 'Head Chef', company: 'Dishoom', location: 'King\'s Cross, London', status: 'Screening' as const, appliedDate: '1 week ago', lastUpdate: '1 day ago' },
        { id: '3', jobTitle: 'Wait Staff', company: 'Breakfast Club', location: 'Brighton, UK', status: 'Applied' as const, appliedDate: '3 days ago', lastUpdate: '3 days ago' },
        { id: '4', jobTitle: 'Kitchen Porter', company: 'Nando\'s', location: 'Camden, London', status: 'Rejected' as const, appliedDate: '2 weeks ago', lastUpdate: '1 week ago' },
        { id: '5', jobTitle: 'Assistant Manager', company: 'Fuller\'s', location: 'Chiswick, London', status: 'Offer' as const, appliedDate: '3 weeks ago', lastUpdate: '2 days ago' },
    ];

    const activeApps = allApplications.filter(app => !['Rejected', 'Withdrawn', 'Offer'].includes(app.status));
    const pastApps = allApplications.filter(app => ['Rejected', 'Withdrawn', 'Offer'].includes(app.status));

    const displayApps = activeTab === 'active' ? activeApps : pastApps;

    return (
        <RoleLayout pageTitle="My Applications">
            <div className="max-w-5xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Active ({activeApps.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'past'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Past ({pastApps.length})
                        </button>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search applications..."
                            className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                    </div>
                </div>

                {displayApps.length > 0 ? (
                    <div className="space-y-6">
                        {displayApps.map(app => (
                            <ApplicationCard key={app.id} application={app} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No applications found</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto">
                            {activeTab === 'active'
                                ? "You don't have any active applications at the moment. Time to find your next shift!"
                                : "Your past applications will appear here once you finish your journey with a role."}
                        </p>
                        {activeTab === 'active' && (
                            <Button variant="primary" className="mt-8 rounded-2xl px-8">
                                Find Jobs
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </RoleLayout>
    );
}
