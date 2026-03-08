'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
    Network,
    User,
    LogOut,
    HelpCircle
} from 'lucide-react';
import { Role } from '@/lib/roles';
import { BrandLogo } from '../ui/BrandLogo';
import { authApi } from '@/lib/api/auth';
import { ROUTES } from '@/config/routes';

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
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
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
    onClose,
    isCollapsed = false,
    onToggleCollapse
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        authApi.logout();
        window.location.href = '/login';
    };

    return (
        <div className="h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col relative transition-all overflow-hidden">
            {/* Header */}
            <div className={`h-20 px-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} shrink-0`}>
                <Link href="/" className="flex items-center min-w-[32px] overflow-hidden">
                    {isCollapsed ? (
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-xl leading-none">
                            Y
                        </div>
                    ) : (
                        <BrandLogo width={140} height={50} />
                    )}
                </Link>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {items.map((item) => {
                    const Icon = IconMap[item.icon] || Grid;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <div key={item.href} className="relative group/nav z-10">
                            <Link
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-between px-3 py-2.5'} rounded-xl text-sm font-medium transition-all group ${isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                                    <div className={`shrink-0 ${isCollapsed ? '' : 'p-1.5'} rounded-lg transition-colors ${isActive ? (isCollapsed ? 'text-indigo-600' : 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400') : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                        }`}>
                                        <Icon className="w-[18px] h-[18px]" />
                                    </div>
                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                </div>

                                {!isCollapsed && (
                                    item.badge ? (
                                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
                                            {item.badge}
                                        </span>
                                    ) : (
                                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'}`} />
                                    )
                                )}
                            </Link>

                            {/* Hover Tooltip when Collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 whitespace-nowrap shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className={`p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 ${isCollapsed ? 'hidden' : 'block'}`}>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Environment
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Live Production
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Utilities */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-1">
                {[
                    { label: 'Profile', icon: User, onClick: () => router.push(role === 'Candidate' ? '/candidate/profile' : '/business/settings/profile') },
                    {
                        label: 'Settings',
                        icon: Settings,
                        onClick: () => {
                            if (role === 'Candidate') router.push(ROUTES.CANDIDATE.SETTINGS);
                            else if (role === 'Admin') router.push(ROUTES.ADMIN.SETTINGS);
                            else router.push(ROUTES.BUSINESS.SETTINGS);
                        }
                    },
                    { label: 'Support', icon: HelpCircle, onClick: () => router.push(['Admin', 'Support'].includes(role as string) ? '/support' : (role === 'Candidate' ? '/candidate/support' : '/business/support')) },
                ].map((item, idx) => (
                    <div key={idx} className="relative group/nav z-10">
                        <button
                            onClick={item.onClick}
                            className={`flex items-center w-full ${isCollapsed ? 'justify-center p-3' : 'justify-start px-3 py-2.5'} rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all`}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                                <div className={`shrink-0 ${isCollapsed ? '' : 'p-1.5'} rounded-lg text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors`}>
                                    <item.icon className="w-[18px] h-[18px]" />
                                </div>
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </div>
                        </button>
                        {isCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 whitespace-nowrap shadow-xl">
                                {item.label}
                            </div>
                        )}
                    </div>
                ))}
                <div className="relative group/nav z-10 mt-2">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full ${isCollapsed ? 'justify-center p-3' : 'justify-start px-3 py-2.5'} rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all`}
                    >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 w-full'}`}>
                            <div className={`shrink-0 ${isCollapsed ? '' : 'p-1.5'} rounded-lg text-rose-400 group-hover:text-rose-600 transition-colors`}>
                                <LogOut className="w-[18px] h-[18px]" />
                            </div>
                            {!isCollapsed && <span className="truncate">Sign Out</span>}
                        </div>
                    </button>
                    {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all z-50 whitespace-nowrap shadow-xl">
                            Sign Out
                        </div>
                    )}
                </div>
            </div>

            {/* Collapse Toggle */}
            {onToggleCollapse && (
                <button
                    onClick={onToggleCollapse}
                    className="absolute -right-3 bottom-8 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 shadow-sm z-50 transition-colors hidden lg:flex"
                >
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
                </button>
            )}
        </div>
    );
}
