'use client';

import React from 'react';
import {
    Menu,
    Bell,
    Search
} from 'lucide-react';
import { Role } from '@/lib/roles';
import { useRouter } from 'next/navigation';

interface TopBarProps {
    role: Role;
    pageTitle?: string;
    pageActions?: React.ReactNode;
    onMenuClick: () => void;
}

export function TopBar({
    role,
    pageTitle,
    pageActions,
    onMenuClick
}: TopBarProps) {
    const router = useRouter();

    return (
        <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {pageTitle && (
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">
                        {pageTitle}
                    </h1>
                )}
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Actions Slot */}
                <div className="hidden sm:flex items-center gap-2">
                    {pageActions}
                </div>

                <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block mx-2" />

                {/* Global Utilities */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </button>
                    {/* User profile actions are now located at the bottom of the collapsible side navigation */}
                </div>
            </div>
        </header>
    );
}
