'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileBottomNav } from '../navigation/MobileBottomNav';
import { Role } from '@/lib/roles';

interface NavItem {
    label: string;
    icon: string;
    href: string;
    badge?: string | number;
    permission?: string;
}

interface AppShellProps {
    role: Role;
    navItems: NavItem[];
    children: React.ReactNode;
    mobileNavItems?: NavItem[];
    pageTitle?: string;
    pageActions?: React.ReactNode;
    rightPanel?: React.ReactNode;
}

export function AppShell({
    role,
    navItems,
    children,
    mobileNavItems,
    pageTitle,
    pageActions,
    rightPanel
}: AppShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col fixed inset-y-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <Sidebar
                    items={navItems}
                    role={role}
                    isCollapsed={isCollapsed}
                    onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
                />
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
                <TopBar
                    role={role}
                    pageTitle={pageTitle}
                    pageActions={pageActions}
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <main className="flex-1 p-4 md:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Primary Content */}
                            <div className="flex-1">
                                {children}
                            </div>

                            {/* Right Rail (Optional) */}
                            {rightPanel && (
                                <aside className="w-full lg:w-80 shrink-0">
                                    <div className="sticky top-24">
                                        {rightPanel}
                                    </div>
                                </aside>
                            )}
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                {mobileNavItems && (
                    <div className="lg:hidden">
                        <MobileBottomNav items={mobileNavItems} />
                    </div>
                )}
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
                        <Sidebar items={navItems} role={role} onClose={() => setSidebarOpen(false)} />
                    </aside>
                </div>
            )}
        </div>
    );
}
