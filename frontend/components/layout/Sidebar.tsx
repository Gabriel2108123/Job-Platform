'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    X,
    ChevronRight,
    Grid,
    Briefcase,
    Users,
    MessageSquare,
    CreditCard,
    Settings,
    Shield,
    LifeBuoy,
    FileText,
    Network
} from 'lucide-react';
import { Role } from '@/lib/roles';
import { BrandLogo } from '../ui/BrandLogo';

interface NavItem {
    label: string;
    icon: string;
    href: string;
    badge?: string | number;
    permission?: string;
}

interface SidebarProps {
    items: NavItem[];
    role: Role;
    onClose?: () => void;
}

// Map string icons to components
const IconMap: Record<string, any> = {
    grid: Grid,
    briefcase: Briefcase,
    users: Users,
    'message-square': MessageSquare,
    'credit-card': CreditCard,
    settings: Settings,
    shield: Shield,
    'life-buoy': LifeBuoy,
    'file-text': FileText,
    network: Network,
    shuffle: Users, // Fallback
};

export function Sidebar({
    items,
    role,
    onClose
}: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
            {/* Header */}
            <div className="h-20 px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <BrandLogo width={140} height={50} />
                </Link>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {items.map((item) => {
                    const Icon = IconMap[item.icon] || Grid;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                    }`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                {item.label}
                            </div>

                            {item.badge ? (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                    {item.badge}
                                </span>
                            ) : (
                                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Meta */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Environment
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Live Production
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
