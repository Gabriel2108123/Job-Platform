'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { User, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NetworkCoworkerCardProps {
    coworker: {
        id: string;
        name: string;
        role: string;
        distance: string;
        commonPlaces: string[];
    };
}

export function NetworkCoworkerCard({ coworker }: NetworkCoworkerCardProps) {
    return (
        <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white dark:bg-slate-900">
            <CardBody className="p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700">
                    <User className="w-8 h-8 text-slate-400" />
                </div>

                <h3 className="font-black text-slate-900 dark:text-white mb-1">{coworker.name}</h3>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">
                    {coworker.role}
                </p>

                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-6">
                    <MapPin className="w-3.5 h-3.5" /> {coworker.distance}
                </div>

                <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                    {coworker.commonPlaces.map(place => (
                        <span key={place} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[9px] font-bold rounded-md">
                            {place}
                        </span>
                    ))}
                </div>

                <Button variant="outline" size="sm" className="w-full rounded-xl border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Message
                </Button>
            </CardBody>
        </Card>
    );
}
