'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Briefcase,
    ClipboardList,
    MessageSquare,
    User,
    Search,
    Grid
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: string;
    href: string;
    badge?: string | number;
}

interface MobileBottomNavProps {
    items: NavItem[];
}

const IconMap: Record<string, any> = {
    home: Home,
    grid: Grid,
    briefcase: Briefcase,
    'clipboard-list': ClipboardList,
    'message-square': MessageSquare,
    user: User,
    search: Search,
};

export function MobileBottomNav({ items }: MobileBottomNavProps) {
    const pathname = usePathname();

    // Limit to 5 items for a clean bottom nav
    const displayItems = items.slice(0, 5);

    return (
        <div className="fixed bottom-0 inset-x-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2">
            {displayItems.map((item) => {
                const Icon = IconMap[item.icon] || item.icon; // Handle both mapping and direct components if needed
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                    >
                        <div className="relative">
                            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'fill-indigo-50 dark:fill-indigo-900/50' : ''}`} />
                            {item.badge && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold tracking-tight">
                            {item.label}
                        </span>
                        {isActive && (
                            <div className="absolute top-0 w-12 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full scale-x-100 transition-transform duration-300" />
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
