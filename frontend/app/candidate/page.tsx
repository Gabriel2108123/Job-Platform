'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Search, FileText } from 'lucide-react';
import { ROUTES } from '@/config/routes';
import Link from 'next/link';

import { RecommendedJobsWidget } from '@/components/dashboard/candidate/RecommendedJobsWidget';
import { ApplicationsSummaryWidget } from '@/components/dashboard/candidate/ApplicationsSummaryWidget';
import { MessagesSummaryWidget } from '@/components/dashboard/candidate/MessagesSummaryWidget';
import { ProfileStrengthWidget } from '@/components/dashboard/candidate/ProfileStrengthWidget';
import { NetworkActivityWidget } from '@/components/dashboard/candidate/NetworkActivityWidget';

export default function CandidateDashboardPage() {
    return (
        <RoleLayout
            pageTitle="Your Journey"
            pageActions={
                <Link href={ROUTES.CANDIDATE.JOBS}>
                    <Button variant="primary" size="sm" className="flex items-center gap-2 rounded-xl">
                        <Search className="w-4 h-4" /> Find Jobs
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20 lg:pb-0">
                {/* Featured Hero Widget */}
                <div className="md:col-span-12 lg:col-span-8 bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden h-[320px] shadow-xl shadow-indigo-600/20">
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">Ready for your<br />next shift?</h2>
                        <p className="text-indigo-100 mb-8 max-w-md text-lg">
                            There are 24 new hospitality roles in your area matching your profile.
                        </p>
                        <div>
                            <Link href={ROUTES.CANDIDATE.JOBS}>
                                <Button variant="outline" className="bg-white text-indigo-600 hover:bg-indigo-50 border-white rounded-2xl font-black text-sm px-8 py-6 h-auto">
                                    Browse New Roles
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
                    <div className="absolute top-1/2 right-12 w-24 h-24 bg-indigo-400/30 rounded-full -translate-y-1/2 blur-md" />
                </div>

                {/* Status Widgets Sidebar */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    <ProfileStrengthWidget />
                    <ApplicationsSummaryWidget />
                </div>

                {/* Secondary Widgets Row */}
                <div className="md:col-span-12 lg:col-span-8">
                    <RecommendedJobsWidget />
                </div>

                <div className="md:col-span-12 lg:col-span-4 space-y-6">
                    <MessagesSummaryWidget />
                    <NetworkActivityWidget />
                </div>
            </div>
        </RoleLayout>
    );
}
