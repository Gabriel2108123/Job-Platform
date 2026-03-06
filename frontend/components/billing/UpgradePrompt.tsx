'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertTriangle,
    Zap,
    X,
    CheckCircle2
} from 'lucide-react';

interface UpgradePromptProps {
    isOpen: boolean;
    onClose: () => void;
    limitType: string;
    currentUsage: number;
    maxLimit: number;
}

export default function UpgradePrompt({
    isOpen,
    onClose,
    limitType,
    currentUsage,
    maxLimit
}: UpgradePromptProps) {
    const router = useRouter();

    if (!isOpen) return null;

    const handleUpgrade = () => {
        router.push('/business/settings/billing');
        onClose();
    };

    const getLimitMessage = () => {
        switch (limitType) {
            case 'JobsPostingLimit':
                return 'You have reached the job posting limit for your current plan.';
            case 'CandidateSearchLimit':
                return 'You have reached the candidate search limit for your current plan.';
            case 'StaffSeats':
                return 'You have reached the staff seat limit for your current plan.';
            default:
                return 'You have reached a usage limit for your current plan.';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative p-6 pb-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 pt-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        Plan Limit Reached
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {getLimitMessage()} Upgrade to a premium plan to continue growing your team and discovery efforts.
                    </p>

                    {/* Stats */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Usage</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{currentUsage} / {maxLimit}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleUpgrade}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 group"
                        >
                            <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                            Upgrade Now
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>

                {/* Footer Benefit */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 border-t border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Unlock unlimited job postings and advanced AI matching
                    </div>
                </div>
            </div>
        </div>
    );
}
