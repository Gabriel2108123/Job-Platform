'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Network, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function NetworkActivityWidget() {
    return (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardBody className="p-6">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Network Insights</h3>

                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <Eye className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Profile Views</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">42</span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Nearby Coworkers</span>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">128</span>
                    </div>
                </div>

                <Link href={ROUTES.CANDIDATE.NETWORK}>
                    <button className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        Explore Network <Network className="w-4 h-4" />
                    </button>
                </Link>
            </CardBody>
        </Card>
    );
}
