'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { Shield, Settings, Users, Building2, Bell } from 'lucide-react';
import { AdminStatsWidget } from '@/components/dashboard/admin/AdminStatsWidget';
import { PlatformHealthWidget } from '@/components/dashboard/admin/PlatformHealthWidget';
import { RecentActivityWidget } from '@/components/dashboard/business/RecentActivityWidget';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

export default function AdminDashboardPage() {
  return (
    <RoleLayout
      pageTitle="System Command"
      pageActions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2">
            <Settings className="w-4 h-4" /> System Config
          </Button>
          <Button variant="primary" size="sm" className="rounded-xl font-black text-xs uppercase tracking-widest gap-2">
            <Shield className="w-4 h-4" /> Security Audit
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-20 lg:pb-0">
        <AdminStatsWidget />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12 lg:col-span-8 space-y-8">
            <RecentActivityWidget />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] bg-indigo-600 text-white p-8 border-none overflow-hidden relative">
                <h4 className="text-xl font-black mb-2 relative z-10">Verification Queue</h4>
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-6 relative z-10">Pending Approval</p>
                <p className="text-3xl font-black mb-1 relative z-10">24 <span className="text-indigo-900/50">/ 128</span></p>
                <p className="text-xs font-bold text-indigo-100 mb-8 relative z-10">Businesses waiting for manual review.</p>
                <Button className="w-full bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest relative z-10">
                  Open Queue
                </Button>
                <Shield className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 rotate-12" />
              </Card>

              <Card className="rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 p-8 border-none overflow-hidden relative border border-slate-200 dark:border-slate-800">
                <h4 className="text-xl font-black mb-2 relative z-10 text-slate-900 dark:text-white">Active Reports</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Support Required</p>
                <p className="text-3xl font-black mb-1 relative z-10 text-rose-600">8</p>
                <p className="text-xs font-bold text-slate-500 mb-8 relative z-10">High priority system alerts flagged.</p>
                <Button variant="outline" className="w-full border-slate-200 dark:border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest relative z-10">
                  Review Alerts
                </Button>
              </Card>
            </div>
          </div>

          <div className="md:col-span-12 lg:col-span-4">
            <PlatformHealthWidget />
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
