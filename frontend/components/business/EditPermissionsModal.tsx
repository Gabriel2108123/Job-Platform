'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Shield, CheckSquare, Square } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrganizationId } from '@/lib/auth-helpers';
import { getAuthHeaders } from '@/lib/auth';

interface EditPermissionsModalProps {
    member: {
        id: string;
        name: string;
        email: string;
        permissions?: string[];
    };
    onClose: () => void;
}

const ALL_PERMISSIONS = [
    { key: 'jobs.create', label: 'Create Jobs', desc: 'Can post new job listings' },
    { key: 'jobs.edit', label: 'Edit Jobs', desc: 'Can edit and close existing jobs' },
    { key: 'candidates.view', label: 'View Candidates', desc: 'Can view candidate profiles' },
    { key: 'candidates.shortlist', label: 'Shortlist Candidates', desc: 'Can shortlist and move candidates through stages' },
    { key: 'interviews.manage', label: 'Manage Interviews', desc: 'Can schedule interviews and trials' },
    { key: 'team.manage', label: 'Manage Team', desc: 'Can invite and remove team members' },
    { key: 'billing.view', label: 'View Billing', desc: 'Can see invoices and subscription info' },
    { key: 'activity.view', label: 'View Activity Log', desc: 'Can access the full audit trail' },
];

export function EditPermissionsModal({ member, onClose }: EditPermissionsModalProps) {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<string[]>(member.permissions || []);

    const toggle = (key: string) =>
        setSelected(prev => prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]);

    const save = useMutation({
        mutationFn: async () => {
            const orgId = getOrganizationId();
            const res = await fetch(`/api/organizations/${orgId}/members/${member.id}/permissions`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ permissions: selected }),
            });
            if (!res.ok) throw new Error('Failed to save permissions');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['org-members'] });
            onClose();
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-fade-in">
                <div className="p-8 pb-0 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Edit Permissions</h2>
                        <p className="text-sm text-slate-500">{member.name} • {member.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors mt-1">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-3">
                    {ALL_PERMISSIONS.map(perm => {
                        const active = selected.includes(perm.key);
                        return (
                            <div
                                key={perm.key}
                                onClick={() => toggle(perm.key)}
                                className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${active ? 'border-indigo-400 bg-indigo-50/40 dark:bg-indigo-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
                            >
                                <div className={`mt-0.5 shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {active ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-black text-sm text-slate-900 dark:text-white">{perm.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{perm.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="p-8 pt-0 border-t border-slate-100 dark:border-slate-800">
                    {save.isError && <p className="text-xs font-bold text-rose-600 mb-3">Failed to save. Please try again.</p>}
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest">Cancel</Button>
                        <Button
                            variant="primary"
                            onClick={() => save.mutate()}
                            disabled={save.isPending}
                            className="flex-1 rounded-2xl font-black text-xs uppercase tracking-widest"
                        >
                            {save.isPending ? 'Saving...' : `Save ${selected.length} Permission${selected.length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
