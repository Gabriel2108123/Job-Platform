'use client';

import React from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { UserCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export function ProfileStrengthWidget() {
    const strength = 85;

    return (
        <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
            <CardBody className="p-6">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Profile Strength</h3>

                <div className="flex items-center gap-6 mb-6">
                    <div className="relative w-20 h-20">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-slate-100 dark:text-slate-800"
                            />
                            <circle
                                cx="40"
                                cy="40"
                                r="36"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - strength / 100)}`}
                                strokeLinecap="round"
                                className="text-indigo-600 dark:text-indigo-400"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white">{strength}%</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Almost there!</p>
                        <p className="text-[10px] text-slate-500 max-w-[120px]">
                            Add your recent work history to reach 100% and get noticed.
                        </p>
                    </div>
                </div>

                <Link href={ROUTES.CANDIDATE.PROFILE}>
                    <button className="w-full py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                        Complete Profile <ChevronRight className="w-4 h-4" />
                    </button>
                </Link>
            </CardBody>
        </Card>
    );
}
