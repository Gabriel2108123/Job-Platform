'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery } from '@tanstack/react-query';
import { CandidateCard } from '@/components/business/CandidateCard';
import { Search, Filter, UserSearch, ListChecks, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

interface Candidate {
    id: string;
    name: string;
    role: string;
    location: string;
    score: number;
    status: string;
    availableFrom: string;
    experience: string;
}

export default function BusinessCandidatesPage() {
    const [view, setView] = useState<'discovery' | 'applicants'>('discovery');
    const [search, setSearch] = useState('');
    const orgId = getOrganizationId();

    const { data: discoveryCandidates = [], isLoading: discoveryLoading } = useQuery<Candidate[]>({
        queryKey: ['candidate-discovery', orgId],
        queryFn: async () => {
            const res = await fetch(`/api/candidate-search?orgId=${orgId}&limit=20`, { headers: getAuthHeaders() });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: view === 'discovery' && !!orgId,
    });

    const { data: applicants = [], isLoading: applicantsLoading } = useQuery<Candidate[]>({
        queryKey: ['org-applicants', orgId],
        queryFn: async () => {
            const res = await fetch(`/api/applications?orgId=${orgId}&format=candidates`, { headers: getAuthHeaders() });
            if (!res.ok) return [];
            return res.json();
        },
        enabled: view === 'applicants' && !!orgId,
    });

    const isLoading = view === 'discovery' ? discoveryLoading : applicantsLoading;
    const allCandidates = view === 'discovery' ? discoveryCandidates : applicants;
    const filtered = allCandidates.filter(c =>
        !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.role?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <RoleLayout pageTitle="Candidate Management">
            <div className="max-w-6xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setView('discovery')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'discovery' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <UserSearch className="w-4 h-4" /> Discovery
                        </button>
                        <button
                            onClick={() => setView('applicants')}
                            className={`px-8 py-3 rounded-[1.75rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${view === 'applicants' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest px-4">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {view === 'discovery' ? 'Top matches for your active jobs' : 'Recent applicants'}
                        </h3>
                        {!isLoading && <span className="text-xs font-bold text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                            <p className="font-black text-slate-500">
                                {search ? `No results for "${search}"` : view === 'discovery' ? 'No matching candidates found.' : 'No applicants yet.'}
                            </p>
                            <p className="text-xs font-bold text-slate-400 mt-2">
                                {view === 'discovery' ? 'Try publishing more active jobs to improve matching.' : 'Applications appear here once candidates apply.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filtered.map(candidate => (
                                <CandidateCard key={candidate.id} candidate={candidate} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </RoleLayout>
    );
}
