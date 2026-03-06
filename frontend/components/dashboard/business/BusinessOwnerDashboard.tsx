'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { PlusCircle } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

import { HiringFunnelWidget } from '@/components/dashboard/business/HiringFunnelWidget';
import { TeamOverviewWidget } from '@/components/dashboard/business/TeamOverviewWidget';
import { BillingSummaryWidget } from '@/components/dashboard/business/BillingSummaryWidget';
import { RecentActivityWidget } from '@/components/dashboard/business/RecentActivityWidget';
import { QuickActionsWidget } from '@/components/dashboard/business/QuickActionsWidget';
import { Card } from '@/components/ui/Card';

export function BusinessOwnerDashboard() {
    return (
        <RoleLayout
            pageTitle="Business Overview"
            pageActions={
                <Link href={ROUTES.BUSINESS.JOBS}>
                    <Button variant="primary" size="sm" className="flex items-center gap-2 rounded-xl">
                        <PlusCircle className="w-4 h-4" /> Post Job
                    </Button>
                </Link>
            }
        >
            <div className="space-y-8 pb-20 lg:pb-0">
                {/* Quick Actions at Top */}
                <QuickActionsWidget />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Main Funnel Chart Area */}
                    <div className="md:col-span-12 lg:col-span-8 space-y-8">
                        <HiringFunnelWidget />
                        <RecentActivityWidget />
                    </div>

                    {/* Sidebar Status Widgets */}
                    <div className="md:col-span-12 lg:col-span-4 space-y-8">
                        <BillingSummaryWidget />
                        <TeamOverviewWidget />

                        {/* Promo / Tip Widget */}
                        <Card className="rounded-[2.5rem] bg-slate-900 text-white p-8 border-none overflow-hidden relative">
                            <div className="relative z-10">
                                <h4 className="text-xl font-black mb-2 leading-tight">Finding Talent in Soho?</h4>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Local Tip</p>
                                <p className="text-sm text-slate-300 mb-8 max-w-[200px]">
                                    Boost your "Senior Bartender" role to reach 40% more local candidates.
                                </p>
                                <Button className="w-full bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                                    Boost Now
                                </Button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl translate-x-1/3 -translate-y-1/3" />
                        </Card>
                    </div>
                </div>
            </div>
        </RoleLayout>
    );
}
