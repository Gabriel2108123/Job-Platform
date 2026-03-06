'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { MessageSquare, LifeBuoy, Map, BookOpen, Search } from 'lucide-react';
import { SupportTicketWidget } from '@/components/dashboard/support/SupportTicketWidget';
import { SystemAnnouncementWidget } from '@/components/dashboard/support/SystemAnnouncementWidget';
import { RecentActivityWidget } from '@/components/dashboard/business/RecentActivityWidget';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';
import { Card, CardBody } from '@/components/ui/Card';

export default function SupportDashboardPage() {
  return (
    <RoleLayout
      pageTitle="Support Workspace"
      pageActions={
        <Link href={ROUTES.SUPPORT.TICKETS}>
          <Button variant="primary" size="sm" className="flex items-center gap-2 rounded-xl font-black text-xs uppercase tracking-widest px-6 h-10">
            <MessageSquare className="w-4 h-4" /> Open Tickets
          </Button>
        </Link>
      }
    >
      <div className="space-y-8 pb-20 lg:pb-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-12 lg:col-span-8 space-y-8">
            {/* Quick Support Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:translate-y-[-2px] transition-all cursor-pointer">
                <CardBody className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                    <Map className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1">Global Map</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Monitor Activity</p>
                </CardBody>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:translate-y-[-2px] transition-all cursor-pointer">
                <CardBody className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1">Articles</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Internal Help</p>
                </CardBody>
              </Card>

              <Card className="rounded-[2rem] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden hover:translate-y-[-2px] transition-all cursor-pointer">
                <CardBody className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                    <LifeBuoy className="w-6 h-6 text-rose-600" />
                  </div>
                  <h4 className="font-black text-slate-900 dark:text-white mb-1">Incident</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report Issue</p>
                </CardBody>
              </Card>
            </div>

            <RecentActivityWidget />
          </div>

          <div className="md:col-span-12 lg:col-span-4 space-y-8">
            <SystemAnnouncementWidget />
            <SupportTicketWidget />
          </div>
        </div>
      </div>
    </RoleLayout>
  );
}
