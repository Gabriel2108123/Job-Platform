'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { User, MapPin, Briefcase, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CandidateCardProps {
    candidate: {
        id: string;
        name: string;
        role: string;
        location: string;
        score: number;
        status: string;
        availableFrom: string;
        experience: string;
    };
}

export function CandidateCard({ candidate }: CandidateCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <CardBody className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                            <User className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                                    {candidate.name}
                                </h3>
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-md text-xs font-black italic">
                                    <Star className="w-3 h-3 fill-amber-600" /> {candidate.score} MATCH
                                </div>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-tight">{candidate.role} • {candidate.experience}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {candidate.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" /> Available {candidate.availableFrom}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-700 font-black text-xs uppercase tracking-widest px-6">
                            View Profile
                        </Button>
                        <Button variant="primary" className="rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest px-6 border-none">
                            Shortlist
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
