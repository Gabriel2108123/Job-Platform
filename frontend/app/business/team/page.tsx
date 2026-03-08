'use client';

import React, { useState } from 'react';
import { RoleLayout } from '@/components/layout/RoleLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamMemberCard } from '@/components/business/TeamMemberCard';
import { InviteMemberModal } from '@/components/business/InviteMemberModal';
import { Shield, UserPlus, Search, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  access: 'Admin' | 'Staff';
  status: 'Active' | 'Invited';
  permissions?: string[];
}

export default function BusinessTeamPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState('');
  const orgId = getOrganizationId();
  const queryClient = useQueryClient();

  const { data: team = [], isLoading } = useQuery<Member[]>({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const res = await fetch(`/api/organizations/${orgId}/members`, { headers: getAuthHeaders() });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      await fetch(`/api/organizations/${orgId}/members/${memberId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-members', orgId] }),
  });

  const filtered = team.filter(m =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RoleLayout
      pageTitle="Team Management"
      pageActions={
        <Button variant="primary" className="rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2" onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      }
    >
      <div className="max-w-5xl">
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white mb-12 shadow-xl shadow-indigo-600/10 flex items-center gap-8 relative overflow-hidden">
          <div className="p-4 bg-white/10 rounded-[2rem] shrink-0">
            <Shield className="w-12 h-12 text-indigo-100" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2">Manage access with precision</h3>
            <p className="text-indigo-100 text-sm max-w-lg mb-4">
              Add staff to help with hiring, but keep control. Admin access allows billing and team management, while Staff access is limited to recruitment activity.
            </p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-300">
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <p className="text-xs font-bold text-slate-500">
            Showing <span className="text-slate-900 dark:text-white">{filtered.length} members</span>
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 text-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
            <p className="font-black text-slate-500">{search ? 'No members match your search.' : 'No team members yet.'}</p>
            <p className="text-xs font-bold text-slate-400 mt-2">Use the "Invite Member" button to add staff to your workspace.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filtered.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onRemove={() => removeMember.mutate(member.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showInvite && <InviteMemberModal onClose={() => setShowInvite(false)} />}
    </RoleLayout>
  );
}
