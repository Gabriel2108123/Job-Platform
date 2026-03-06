'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { BusinessJobCard } from '@/components/business/BusinessJobCard';
import { PlusCircle, Search, Filter, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BusinessJobsPage() {
  const jobs = [
    { id: '1', title: 'Senior Bartender', location: 'Soho, London', status: 'Active' as const, applicants: 42, views: 1250, postedAt: '2 days ago' },
    { id: '2', title: 'Head Chef', location: 'King\'s Cross, London', status: 'Active' as const, applicants: 12, views: 450, postedAt: '5 days ago' },
    { id: '3', title: 'Wait Staff', location: 'Brighton, UK', status: 'Draft' as const, applicants: 0, views: 0, postedAt: 'N/A' },
    { id: '4', title: 'Receptionist', location: 'The Strand, London', status: 'Closed' as const, applicants: 85, views: 3200, postedAt: '1 month ago' },
  ];

  return (
    <RoleLayout
      pageTitle="Job Management"
      pageActions={
        <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create New Role
        </Button>
      }
    >
      <div className="max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl">
              <Briefcase className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 dark:text-white">Active Roles</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">You have 2 active roles live</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <Button variant="outline" className="rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs uppercase tracking-widest px-4">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {jobs.map(job => (
            <BusinessJobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
