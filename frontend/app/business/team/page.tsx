'use client';

import React from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';

import { TeamMemberCard } from '@/components/business/TeamMemberCard';
import { Shield, UserPlus, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BusinessTeamPage() {
  const team = [
    { id: 'owners-1', name: 'Gabriel Owners', email: 'owner@example.com', role: 'Business Owner', access: 'Admin' as const, status: 'Active' as const },
    { id: 'staff-1', name: 'James Wilson', email: 'james@example.com', role: 'Staff Manager', access: 'Admin' as const, status: 'Active' as const },
    { id: 'staff-2', name: 'Sarah Blake', email: 'sarah@example.com', role: 'Supervisor', access: 'Staff' as const, status: 'Active' as const },
    { id: 'staff-3', name: 'Michael Ross', email: 'michael@example.com', role: 'Recruiter', access: 'Staff' as const, status: 'Invited' as const },
  ];

  return (
    <RoleLayout
      pageTitle="Team Management"
      pageActions={
        <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      }
    >
      <div className="max-w-5xl">
        {/* Permission Info Box */}
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white mb-12 shadow-xl shadow-indigo-600/10 flex items-center gap-8 relative overflow-hidden">
          <div className="p-4 bg-white/10 rounded-[2rem] shrink-0">
            <Shield className="w-12 h-12 text-indigo-100" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Manage access with precision</h3>
            <p className="text-indigo-100 text-sm max-w-lg mb-4">
              Add staff to help with hiring, but keep control. Admin access allows billing and team management, while Staff access is limited to recruitment activity.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-300">
              <Info className="w-3.5 h-3.5" /> Read about permission levels
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 dark:text-white">{team.length} members</span>
          </p>
        </div>

        <div className="space-y-6">
          {team.map(member => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </RoleLayout>
  );
}
