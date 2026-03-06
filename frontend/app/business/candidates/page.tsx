'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { useState } from 'react';
import { CandidateCard } from '@/components/business/CandidateCard';
import { Search, Filter, Users, UserSearch, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BusinessCandidatesPage() {
    const [view, setView] = useState<'discovery' | 'applicants'>('discovery');

    const candidates = [
        { id: '1', name: 'Alex Rivera', role: 'Bartender', location: 'Soho, London', score: 98, status: 'New', availableFrom: 'Immediate', experience: '5 years' },
        { id: '2', name: 'Sarah Miller', role: 'Wait Staff', location: 'Camden, London', score: 92, status: 'Shortlisted', availableFrom: '2 weeks', experience: '2 years' },
        { id: '3', name: 'James Chen', role: 'Head Chef', location: 'Soho, London', score: 85, status: 'New', availableFrom: 'Immediate', experience: '8 years' },
        { id: '4', name: 'Elena Petrova', role: 'Events Staff', location: 'Central London', score: 78, status: 'New', availableFrom: '1 month', experience: '1 year' },
    ];

    return (
        <RoleLayout pageTitle="Candidate Management">
            <div className="max-w-6xl">
                {/* View Switcher */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setView('discovery')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'discovery'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <UserSearch className="w-4 h-4" /> Discovery
                        </button>
                        <button
                            onClick={() => setView('applicants')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'applicants'
                                    ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <ListChecks className="w-4 h-4" /> Applicants
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search candidates..."
                                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest px-4">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Discovery Layout */}
                <div className="grid grid-cols-1 gap-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                            {view === 'discovery' ? 'Top matches for your active jobs' : 'Recent applicants'}
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {candidates.map(candidate => (
                            <CandidateCard key={candidate.id} candidate={candidate} />
                        ))}
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
