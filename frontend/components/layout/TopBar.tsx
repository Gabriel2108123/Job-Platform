'use client';

import React from 'react';
import {
    Menu,
    Bell,
    HelpCircle,
    User,
    Search,
    LogOut,
    Settings
} from 'lucide-react';
import { Role, getRoleDisplayName } from '@/lib/roles';
import { authApi } from '@/lib/api/auth';
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

    const handleLogout = () => {
        authApi.logout();
        window.location.href = '/login';
    };

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

                    <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden md:block">
                        <HelpCircle className="w-5 h-5" />
                    </button>

                    {/* User Profile Menu */}
                    <div className="relative group ml-1">
                        <button className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                    {getRoleDisplayName(role)}
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                                <User className="w-5 h-5" />
                            </div>
                        </button>

                        {/* Dropdown would go here - simplified for now */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100 py-2">
                            <button
                                onClick={() => router.push('/profile')}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                                <User className="w-4 h-4" /> My Profile
                            </button>
                            <button
                                onClick={() => router.push('/settings')}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" /> Settings
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
