'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { ROUTES } from '@/config/routes';
import { Building2, Shield, CreditCard, Bell, Globe, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth-helpers';

const sections = [
    { title: 'Business Profile', desc: 'Company details, logo, and location', icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', href: '/business/settings/profile' },
    { title: 'Workspace & Security', desc: 'Environment settings and MFA', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', href: '/business/settings/security' },
    { title: 'Billing & Plans', desc: 'Manage subscription and invoices', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', href: ROUTES.BUSINESS.BILLING },
    { title: 'System Notifications', desc: 'Control applicant and team alerts', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', href: '/business/settings/notifications' },
    { title: 'Public Branding', desc: 'Career page and custom domain', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', href: '/business/settings/profile' },
];

export default function BusinessSettingsPage() {
    const user = getCurrentUser();
    const orgName = user?.name || 'Your Organisation';
    const workspaceId = user?.organizationId?.slice(0, 8).toUpperCase() || '—';

    return (
        <RoleLayout pageTitle="Business Settings">
            <div className="max-w-3xl space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm mb-8 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shrink-0">
                        <Building2 className="w-10 h-10 text-slate-300" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{orgName}</h2>
                        <p className="text-sm font-bold text-slate-500">Workspace ID: JP-{workspaceId}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {sections.map(section => (
                        <Link href={section.href} key={section.title}>
                            <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md transition-all cursor-pointer group">
                                <CardBody className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className={`p-4 rounded-2xl ${section.bg} ${section.color}`}>
                                                <section.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 dark:text-white">{section.title}</h3>
                                                <p className="text-xs font-bold text-slate-500">{section.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </CardBody>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </RoleLayout>
    );
}
