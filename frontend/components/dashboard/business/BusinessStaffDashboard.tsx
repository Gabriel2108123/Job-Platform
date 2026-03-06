'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { StaffWelcomeHero } from '@/components/dashboard/business/StaffWelcomeHero';
import { StaffTaskWidget } from '@/components/dashboard/business/StaffTaskWidget';
import { RecentActivityWidget } from '@/components/dashboard/business/RecentActivityWidget';
import { HiringFunnelWidget } from '@/components/dashboard/business/HiringFunnelWidget';

export default function BusinessStaffDashboard() {
    return (
        <RoleLayout pageTitle="Workspace">
            <div className="space-y-8 pb-20 lg:pb-0">
                <StaffWelcomeHero />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-12 lg:col-span-8 space-y-8">
                        <HiringFunnelWidget />
                        <RecentActivityWidget />
                    </div>
                    <div className="md:col-span-12 lg:col-span-4 space-y-8">
                        <StaffTaskWidget />

                        <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                            <h4 className="text-xl font-black mb-2 relative z-10">Need Help?</h4>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 relative z-10">Staff Support</p>
                            <p className="text-sm text-slate-300 mb-8 relative z-10">Access quick guides on screening best practices.</p>
                            <button className="w-full py-4 bg-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all relative z-10 shadow-lg shadow-indigo-600/20">
                                View Guides
                            </button>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                        </div>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
